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

    const { assignmentId } = await params;
    const assignId = parseInt(assignmentId, 10);

    if (isNaN(assignId)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const body = await request.json();

    const assignment = await prisma.runwayEventAssignment.update({
      where: { id: assignId },
      data: { status: body.status },
    });

    revalidateAll();
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating Runway event assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
