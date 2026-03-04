import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const circleId = parseInt(id, 10);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
    }

    const circle = await prisma.mentorCircle.findUnique({
      where: { id: circleId },
      include: {
        sessions: {
          include: {
            attendees: {
              include: { mentor: true },
              orderBy: { mentor: { name: 'asc' } },
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    return NextResponse.json(circle);
  } catch (error) {
    console.error('Error fetching circle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circle' },
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
    const circleId = parseInt(id, 10);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
    }

    const body = await request.json();

    const circle = await prisma.mentorCircle.update({
      where: { id: circleId },
      data: {
        name: body.name,
        coordinator: body.coordinator,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        semester: body.semester,
        location: body.location,
        notes: body.notes,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(circle);
  } catch (error) {
    console.error('Error updating circle:', error);
    return NextResponse.json(
      { error: 'Failed to update circle' },
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
    const circleId = parseInt(id, 10);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
    }

    await prisma.mentorCircle.delete({ where: { id: circleId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting circle:', error);
    return NextResponse.json(
      { error: 'Failed to delete circle' },
      { status: 500 }
    );
  }
}
