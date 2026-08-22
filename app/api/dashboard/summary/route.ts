import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get summary statistics
    const links = await prisma.link.findMany({
      where: { userId: session.userId },
      include: {
        analytics: true,
        visitors: {
          select: { id: true },
        },
      },
    });

    const totalLinks = links.length;
    const totalVisits = links.reduce((sum, link) => sum + (link.analytics?.totalVisits || 0), 0);
    const uniqueVisitors = links.reduce(
      (sum, link) => sum + (link.analytics?.uniqueVisitors || 0),
      0
    );
    const avgConsentRate =
      links.length > 0
        ? links.reduce((sum, link) => sum + (link.analytics?.consentRate || 0), 0) /
          links.length
        : 0;

    // Get recent visits
    const recentVisits = await prisma.visitor.findMany({
      where: {
        link: {
          userId: session.userId,
        },
      },
      include: {
        link: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        visitedAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      summary: {
        totalLinks,
        totalVisits,
        uniqueVisitors,
        avgConsentRate: parseFloat(avgConsentRate.toFixed(2)),
        activeLinks: links.filter((l) => l.active).length,
      },
      recentVisits,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
