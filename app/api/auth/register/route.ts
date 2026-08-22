import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { RegisterSchema } from '@/lib/validation';
import { createSession, setSessionCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/security';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 'register');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name, password } = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // Create session
    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    await setSessionCookie(token);

    // Log audit
    await logAudit(user.id, 'user_registered', { email });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
