import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId } = body as { mentorId: number };

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId is required' },
        { status: 400 }
      );
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    if (mentor.programs.includes('Runway Program')) {
      return NextResponse.json(mentor);
    }

    const updated = await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        programs: [...mentor.programs, 'Runway Program'],
      },
    });

    revalidateAll();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error adding mentor to Runway program:', error);
    return NextResponse.json(
      { error: 'Failed to add mentor to Runway program' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId } = body as { mentorId: number };

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId is required' },
        { status: 400 }
      );
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const updated = await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        programs: mentor.programs.filter((p) => p !== 'Runway Program'),
      },
    });

    revalidateAll();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error removing mentor from Runway program:', error);
    return NextResponse.json(
      { error: 'Failed to remove mentor from Runway program' },
      { status: 500 }
    );
  }
}
