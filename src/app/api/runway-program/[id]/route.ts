import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await prisma.runwayEvent.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Runway event' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const event = await prisma.runwayEvent.update({
      where: { id: eventId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        title: body.title,
        description: body.description,
        location: body.location,
        semester: body.semester,
        cancelled: body.cancelled,
      },
    });

    revalidateAll();
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to update Runway event' },
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

    await prisma.runwayEvent.delete({ where: { id: eventId } });

    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to delete Runway event' },
      { status: 500 }
    );
  }
}
