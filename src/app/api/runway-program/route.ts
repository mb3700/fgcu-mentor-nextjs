import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') || undefined;

    const where: Record<string, unknown> = {};
    if (semester) where.semester = semester;

    const events = await prisma.runwayEvent.findMany({
      where,
      include: {
        assignments: {
          include: {
            mentor: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching Runway events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Runway events' },
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

    const event = await prisma.runwayEvent.create({
      data: {
        date: new Date(body.date),
        title: body.title,
        description: body.description || null,
        location: body.location || null,
        semester: body.semester,
      },
    });

    revalidateAll();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating Runway event:', error);
    return NextResponse.json(
      { error: 'Failed to create Runway event' },
      { status: 500 }
    );
  }
}
