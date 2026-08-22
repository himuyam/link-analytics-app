import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '@/lib/security';
import { updateAnalytics } from '@/lib/analytics';

const prisma = new PrismaClient();

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

    // Delete all visitors for this link
    await prisma.visitor.deleteMany({
      where: { linkId: params.id },
    });

    // Reset analytics
    await updateAnalytics(params.id);

    await logAudit(session.userId, 'link_data_cleared', { linkId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear link data error:', error);
    return NextResponse.json(
      { error: 'Failed to clear link data' },
      { status: 500 }
    );
  }
}
