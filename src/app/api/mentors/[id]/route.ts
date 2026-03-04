import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mentorId = parseInt(id, 10);

    if (isNaN(mentorId)) {
      return NextResponse.json({ error: 'Invalid mentor ID' }, { status: 400 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: { interactions: { orderBy: { date: 'desc' } } },
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor' },
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
    const mentorId = parseInt(id, 10);

    if (isNaN(mentorId)) {
      return NextResponse.json({ error: 'Invalid mentor ID' }, { status: 400 });
    }

    const body = await request.json();

    const existing = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const mentor = await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        name: body.name,
        status: body.status,
        businessName: body.businessName,
        title: body.title,
        location: body.location,
        phone: body.phone,
        email: body.email,
        biography: body.biography,
        fgcuAlumni: body.fgcuAlumni,
        domainExpertise: body.domainExpertise,
        sectorExpertise: body.sectorExpertise,
        programs: body.programs,
        workStatus: body.workStatus,
        potentialSpeaker: body.potentialSpeaker,
        potentialJudge: body.potentialJudge,
        mentorCoordinator: body.mentorCoordinator,
        veteranStatus: body.veteranStatus,
        photoUrl: body.photoUrl,
      },
    });

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to update mentor' },
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
    const mentorId = parseInt(id, 10);

    if (isNaN(mentorId)) {
      return NextResponse.json({ error: 'Invalid mentor ID' }, { status: 400 });
    }

    const existing = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    await prisma.mentor.delete({ where: { id: mentorId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to delete mentor' },
      { status: 500 }
    );
  }
}
