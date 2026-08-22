import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { CreateLinkSchema } from '@/lib/validation';
import { generateSecureSlug, sanitizeUrl, logAudit } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 'linkCreation');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many link creations. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    const validationResult = CreateLinkSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, destinationUrl, retentionDays, expiresAt } = validationResult.data;

    // Sanitize URL
    const sanitizedUrl = sanitizeUrl(destinationUrl);

    // Generate unique slug
    let slug: string;
    let isUnique = false;
    while (!isUnique) {
      slug = generateSecureSlug(8);
      const existing = await prisma.link.findUnique({
        where: { slug },
      });
      isUnique = !existing;
    }

    // Create link
    const link = await prisma.link.create({
      data: {
        userId: session.userId,
        slug: slug!,
        name,
        destinationUrl: sanitizedUrl,
        retentionDays,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    // Create analytics record
    await prisma.analytics.create({
      data: {
        linkId: link.id,
      },
    });

    // Log audit
    await logAudit(session.userId, 'link_created', {
      linkId: link.id,
      slug: link.slug,
      name: link.name,
    });

    return NextResponse.json(
      {
        success: true,
        link: {
          id: link.id,
          slug: link.slug,
          name: link.name,
          destinationUrl: link.destinationUrl,
          active: link.active,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/l/${link.slug}`,
          createdAt: link.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const links = await prisma.link.findMany({
      where: { userId: session.userId },
      include: {
        analytics: {
          select: {
            totalVisits: true,
            consentRate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    const total = await prisma.link.count({
      where: { userId: session.userId },
    });

    return NextResponse.json({
      links,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}
