import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string; attendeeId: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attendeeId } = await params;
    const aid = parseInt(attendeeId, 10);

    if (isNaN(aid)) {
      return NextResponse.json({ error: 'Invalid attendee ID' }, { status: 400 });
    }

    const body = await request.json();

    const attendee = await prisma.sessionAttendee.update({
      where: { id: aid },
      data: { status: body.status },
      include: { mentor: true },
    });

    return NextResponse.json(attendee);
  } catch (error) {
    console.error('Error updating attendee:', error);
    return NextResponse.json(
      { error: 'Failed to update attendee' },
      { status: 500 }
    );
  }
}
