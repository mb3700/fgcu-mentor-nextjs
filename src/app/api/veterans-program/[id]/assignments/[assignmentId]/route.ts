import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, assignmentId } = await params;
    const workshopId = parseInt(id, 10);
    const assignmentIdNum = parseInt(assignmentId, 10);

    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    if (isNaN(assignmentIdNum)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const body = await request.json();

    const assignment = await prisma.vepWorkshopAssignment.update({
      where: {
        id: assignmentIdNum,
        workshopId,
      },
      data: {
        status: body.status,
      },
    });

    revalidateAll();
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating VEP workshop assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update VEP workshop assignment' },
      { status: 500 }
    );
  }
}
