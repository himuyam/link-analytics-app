import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const link = await prisma.link.findUnique({
      where: { id: params.id },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (link.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    // Get visitors with optional location data
    const visitors = await prisma.visitor.findMany({
      where: { linkId: link.id },
      select: {
        id: true,
        visitedAt: true,
        consentGiven: true,
        approximateCountry: true,
        approximateCity: true,
        approximateLatitude: true,
        approximateLongitude: true,
        preciseLatitude: true,
        preciseLongitude: true,
        preciseLocationGrantedAt: true,
        browser: true,
        operatingSystem: true,
        deviceType: true,
        referrer: true,
      },
      orderBy: { visitedAt: 'desc' },
      skip,
      take: pageSize,
    });

    const total = await prisma.visitor.count({
      where: { linkId: link.id },
    });

    return NextResponse.json({
      visitors,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
      { status: 500 }
    );
  }
}
