import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-secret-key-change-in-production'
);

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const session = await prisma.session.create({
    data: {
      userId: payload.userId,
      token,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
    },
  });

  return session.token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__Host-session')?.value;

  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  // Verify session still exists in DB
  const dbSession = await prisma.session.findUnique({
    where: { token },
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('__Host-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE / 1000,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__Host-session')?.value;

  if (token) {
    await prisma.session.delete({
      where: { token },
    }).catch(() => null);
  }

  cookieStore.delete('__Host-session');
}
