import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './auth';
import crypto from 'crypto';

export function generateSecureSlug(length: number = 8): string {
  return crypto.randomBytes(length).toString('base64url');
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Block dangerous schemes
    if (['javascript:', 'data:', 'file:', 'vbscript:'].includes(parsed.protocol)) {
      throw new Error('Invalid scheme');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

export function hashSessionId(userAgent: string, ipAddress: string): string {
  return crypto
    .createHash('sha256')
    .update(`${userAgent}:${ipAddress}:${process.env.AUTH_SALT || 'salt'}`)
    .digest('hex');
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return session;
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || request.ip || 'unknown';
  return ip.trim();
}

export function extractBrowserInfo(userAgent: string) {
  // Simple browser detection
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  }

  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    deviceType = 'mobile';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
  }

  return { browser, os, deviceType };
}

export async function logAudit(
  userId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
