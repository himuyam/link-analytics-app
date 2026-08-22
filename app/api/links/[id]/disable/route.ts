import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '@/lib/security';

const prisma = new PrismaClient();

export async function POST(
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

    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: { active: false },
    });

    await logAudit(session.userId, 'link_disabled', { linkId: params.id });

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error('Disable link error:', error);
    return NextResponse.json(
      { error: 'Failed to disable link' },
      { status: 500 }
    );
  }
}
