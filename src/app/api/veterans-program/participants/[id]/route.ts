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
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
    }

    const participant = await prisma.vepParticipant.findUnique({
      where: { id: participantId },
      include: {
        mentor: true,
        workshopAssignments: {
          include: {
            workshop: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error fetching VEP participant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VEP participant' },
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
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
    }

    const body = await request.json();

    const participant = await prisma.vepParticipant.update({
      where: { id: participantId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        role: body.role,
        roleDetail: body.roleDetail,
        mentorId: body.mentorId,
      },
    });

    revalidateAll();
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error updating VEP participant:', error);
    return NextResponse.json(
      { error: 'Failed to update VEP participant' },
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
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return NextResponse.json({ error: 'Invalid participant ID' }, { status: 400 });
    }

    await prisma.vepParticipant.delete({ where: { id: participantId } });

    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting VEP participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete VEP participant' },
      { status: 500 }
    );
  }
}
