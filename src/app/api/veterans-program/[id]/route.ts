import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workshopId = parseInt(id, 10);

    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    const workshop = await prisma.vepWorkshop.findUnique({
      where: { id: workshopId },
      include: {
        assignments: {
          include: {
            participant: {
              include: { mentor: true },
            },
          },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Error fetching VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VEP workshop' },
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
    const workshopId = parseInt(id, 10);

    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    const body = await request.json();

    const workshop = await prisma.vepWorkshop.update({
      where: { id: workshopId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        topic: body.topic,
        notes: body.notes,
        cancelled: body.cancelled,
      },
    });

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Error updating VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to update VEP workshop' },
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
    const workshopId = parseInt(id, 10);

    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    await prisma.vepWorkshop.delete({ where: { id: workshopId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to delete VEP workshop' },
      { status: 500 }
    );
  }
}
