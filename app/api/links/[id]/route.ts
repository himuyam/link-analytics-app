import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { UpdateLinkSchema } from '@/lib/validation';
import { logAudit } from '@/lib/security';

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
      include: {
        analytics: true,
      },
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

    return NextResponse.json({ link });
  } catch (error) {
    console.error('Get link error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const validationResult = UpdateLinkSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: {
        ...validationResult.data,
      },
    });

    await logAudit(session.userId, 'link_updated', { linkId: params.id });

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error('Update link error:', error);
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete associated data
    await prisma.visitor.deleteMany({
      where: { linkId: params.id },
    });

    await prisma.analytics.deleteMany({
      where: { linkId: params.id },
    });

    await prisma.link.delete({
      where: { id: params.id },
    });

    await logAudit(session.userId, 'link_deleted', { linkId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete link error:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
