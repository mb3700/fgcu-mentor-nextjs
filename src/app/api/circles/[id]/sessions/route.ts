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
    const circleId = parseInt(id, 10);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
    }

    const sessions = await prisma.circleSession.findMany({
      where: { circleId },
      include: {
        attendees: {
          include: { mentor: true },
          orderBy: { mentor: { name: 'asc' } },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

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
    const circleId = parseInt(id, 10);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: 'Invalid circle ID' }, { status: 400 });
    }

    const body = await request.json();

    const session = await prisma.circleSession.create({
      data: {
        circleId,
        date: new Date(body.date),
        notes: body.notes || null,
      },
    });

    revalidateAll();
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
