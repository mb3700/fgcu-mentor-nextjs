import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

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
    const workshopId = parseInt(id, 10);

    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    const body = await request.json();
    const { participantIds } = body as { participantIds: number[] };

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'participantIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get existing assignments to skip duplicates
    const existing = await prisma.vepWorkshopAssignment.findMany({
      where: {
        workshopId,
        participantId: { in: participantIds },
      },
      select: { participantId: true },
    });

    const existingIds = new Set(existing.map((a) => a.participantId));
    const newIds = participantIds.filter((pid) => !existingIds.has(pid));

    if (newIds.length > 0) {
      await prisma.vepWorkshopAssignment.createMany({
        data: newIds.map((participantId) => ({
          workshopId,
          participantId,
          status: 'scheduled',
        })),
      });
    }

    // Return all assignments for this workshop
    const assignments = await prisma.vepWorkshopAssignment.findMany({
      where: { workshopId },
      include: {
        participant: {
          include: { mentor: true },
        },
      },
    });

    return NextResponse.json(assignments, { status: 201 });
  } catch (error) {
    console.error('Error assigning participants to VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to assign participants to VEP workshop' },
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

    const body = await request.json();
    const { participantId } = body as { participantId: number };

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    await prisma.vepWorkshopAssignment.delete({
      where: {
        workshopId_participantId: {
          workshopId,
          participantId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing participant from VEP workshop:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant from VEP workshop' },
      { status: 500 }
    );
  }
}
