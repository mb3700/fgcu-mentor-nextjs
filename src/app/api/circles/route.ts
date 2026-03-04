import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') || undefined;
    const active = searchParams.get('active');

    const where: Record<string, unknown> = {};
    if (semester) where.semester = semester;
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const circles = await prisma.mentorCircle.findMany({
      where,
      include: {
        sessions: {
          include: {
            attendees: {
              include: { mentor: true },
            },
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(circles);
  } catch (error) {
    console.error('Error fetching circles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const circle = await prisma.mentorCircle.create({
      data: {
        name: body.name,
        coordinator: body.coordinator,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        semester: body.semester,
        location: body.location || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(circle, { status: 201 });
  } catch (error) {
    console.error('Error creating circle:', error);
    return NextResponse.json(
      { error: 'Failed to create circle' },
      { status: 500 }
    );
  }
}
