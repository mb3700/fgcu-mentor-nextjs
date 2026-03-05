import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') || undefined;

    const where: Record<string, unknown> = {};
    if (semester) where.semester = semester;

    const workshops = await prisma.vepWorkshop.findMany({
      where,
      include: {
        assignments: {
          include: {
            participant: {
              include: { mentor: true },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(workshops);
  } catch (error) {
    console.error('Error fetching VEP workshops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VEP workshops' },
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

    const workshop = await prisma.vepWorkshop.create({
      data: {
        date: new Date(body.date),
        topic: body.topic,
        notes: body.notes || null,
        semester: body.semester,
      },
    });

    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    console.error('Error creating VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to create VEP workshop' },
      { status: 500 }
    );
  }
}
