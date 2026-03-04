import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const sid = parseInt(sessionId, 10);

    if (isNaN(sid)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const body = await request.json();

    const session = await prisma.circleSession.update({
      where: { id: sid },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        cancelled: body.cancelled !== undefined ? body.cancelled : undefined,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const sid = parseInt(sessionId, 10);

    if (isNaN(sid)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    await prisma.circleSession.delete({ where: { id: sid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
