import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getClientIp } from './security';

const prisma = new PrismaClient();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || '900000'),
    maxAttempts: parseInt(process.env.RATE_LIMIT_LOGIN_MAX_ATTEMPTS || '5'),
  },
  register: {
    windowMs: parseInt(process.env.RATE_LIMIT_REGISTRATION_WINDOW_MS || '3600000'),
    maxAttempts: parseInt(process.env.RATE_LIMIT_REGISTRATION_MAX_ATTEMPTS || '3'),
  },
  linkCreation: {
    windowMs: parseInt(process.env.RATE_LIMIT_LINK_CREATION_WINDOW_MS || '3600000'),
    maxAttempts: parseInt(process.env.RATE_LIMIT_LINK_CREATION_MAX_ATTEMPTS || '20'),
  },
};

export async function checkRateLimit(
  request: NextRequest,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return { allowed: true, remaining: -1, resetTime: new Date() };
  }

  const key = `${action}:${getClientIp(request)}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Clean up old entries
  await prisma.rateLimit.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  // Get current attempts
  const entry = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (!entry) {
    // Create new entry
    await prisma.rateLimit.create({
      data: {
        key,
        action,
        attempts: 1,
        expiresAt: new Date(now.getTime() + config.windowMs),
      },
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: new Date(now.getTime() + config.windowMs),
    };
  }

  const remaining = config.maxAttempts - entry.attempts;

  if (entry.attempts >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.expiresAt,
    };
  }

  // Increment attempts
  await prisma.rateLimit.update({
    where: { key },
    data: { attempts: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: Math.max(0, remaining - 1),
    resetTime: entry.expiresAt,
  };
}
