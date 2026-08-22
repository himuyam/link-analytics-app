import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PreciseLocationSchema } from '@/lib/validation';
import { updateAnalytics } from '@/lib/analytics';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const visitor = await prisma.visitor.findUnique({
      where: { id: params.id },
      include: {
        link: true,
      },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Verify consent was given
    if (!visitor.consentGiven) {
      return NextResponse.json(
        { error: 'Location consent not given' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = PreciseLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid location data' },
        { status: 400 }
      );
    }

    const { latitude, longitude, accuracy } = validationResult.data;

    // Update visitor with precise location
    const updatedVisitor = await prisma.visitor.update({
      where: { id: params.id },
      data: {
        preciseLatitude: latitude,
        preciseLongitude: longitude,
        preciseAccuracy: accuracy,
        preciseLocationGrantedAt: new Date(),
      },
    });

    // Update analytics
    await updateAnalytics(visitor.linkId);

    return NextResponse.json({
      success: true,
      visitor: {
        id: updatedVisitor.id,
        preciseLocationGrantedAt: updatedVisitor.preciseLocationGrantedAt,
      },
    });
  } catch (error) {
    console.error('Location submission error:', error);
    return NextResponse.json(
      { error: 'Failed to store location' },
      { status: 500 }
    );
  }
}
