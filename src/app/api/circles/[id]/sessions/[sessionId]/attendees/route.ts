import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const sid = parseInt(sessionId, 10);

    if (isNaN(sid)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const attendees = await prisma.sessionAttendee.findMany({
      where: { sessionId: sid },
      include: { mentor: true },
      orderBy: { mentor: { name: 'asc' } },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const mentorIds: number[] = body.mentorIds;

    if (!mentorIds || !Array.isArray(mentorIds) || mentorIds.length === 0) {
      return NextResponse.json({ error: 'mentorIds array required' }, { status: 400 });
    }

    // Use createMany with skipDuplicates to handle already-assigned mentors
    await prisma.sessionAttendee.createMany({
      data: mentorIds.map((mentorId) => ({
        sessionId: sid,
        mentorId,
        status: 'scheduled',
      })),
      skipDuplicates: true,
    });

    // Return full list of attendees for this session
    const attendees = await prisma.sessionAttendee.findMany({
      where: { sessionId: sid },
      include: { mentor: true },
      orderBy: { mentor: { name: 'asc' } },
    });

    revalidateAll();
    return NextResponse.json(attendees, { status: 201 });
  } catch (error) {
    console.error('Error assigning mentors:', error);
    return NextResponse.json(
      { error: 'Failed to assign mentors' },
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
    const body = await request.json();
    const mentorId = body.mentorId;

    if (isNaN(sid) || !mentorId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    await prisma.sessionAttendee.deleteMany({
      where: { sessionId: sid, mentorId },
    });

    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing attendee:', error);
    return NextResponse.json(
      { error: 'Failed to remove attendee' },
      { status: 500 }
    );
  }
}
