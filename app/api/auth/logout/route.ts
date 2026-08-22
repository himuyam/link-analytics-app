import { NextRequest, NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/auth';
import { logAudit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await logAudit(session.userId, 'user_logout');
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
