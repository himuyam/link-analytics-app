import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '@/lib/security';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { linkId: string; visitorId: string } }
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
      where: { id: params.linkId },
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

    const visitor = await prisma.visitor.findUnique({
      where: { id: params.visitorId },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    if (visitor.linkId !== params.linkId) {
      return NextResponse.json(
        { error: 'Visitor does not belong to this link' },
        { status: 400 }
      );
    }

    await prisma.visitor.delete({
      where: { id: params.visitorId },
    });

    await logAudit(session.userId, 'visitor_deleted', {
      linkId: params.linkId,
      visitorId: params.visitorId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete visitor error:', error);
    return NextResponse.json(
      { error: 'Failed to delete visitor' },
      { status: 500 }
    );
  }
}
