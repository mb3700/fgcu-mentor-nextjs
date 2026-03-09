import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const body = await request.json();
    const { mentorIds } = body as { mentorIds: number[] };

    if (!Array.isArray(mentorIds) || mentorIds.length === 0) {
      return NextResponse.json(
        { error: 'mentorIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get existing assignments to skip duplicates
    const existing = await prisma.runwayEventAssignment.findMany({
      where: {
        eventId,
        mentorId: { in: mentorIds },
      },
      select: { mentorId: true },
    });

    const existingIds = new Set(existing.map((a) => a.mentorId));
    const newIds = mentorIds.filter((mid) => !existingIds.has(mid));

    if (newIds.length > 0) {
      await prisma.runwayEventAssignment.createMany({
        data: newIds.map((mentorId) => ({
          eventId,
          mentorId,
          status: 'scheduled',
        })),
      });
    }

    // Return all assignments for this event
    const assignments = await prisma.runwayEventAssignment.findMany({
      where: { eventId },
      include: { mentor: true },
    });

    revalidateAll();
    return NextResponse.json(assignments, { status: 201 });
  } catch (error) {
    console.error('Error assigning mentors to Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to assign mentors to Runway event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const body = await request.json();
    const { mentorId } = body as { mentorId: number };

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId is required' },
        { status: 400 }
      );
    }

    await prisma.runwayEventAssignment.delete({
      where: {
        eventId_mentorId: {
          eventId,
          mentorId,
        },
      },
    });

    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing mentor from Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to remove mentor from Runway event' },
      { status: 500 }
    );
  }
}
