import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    const participants = await prisma.vepParticipant.findMany({
      where,
      include: {
        mentor: true,
        workshopAssignments: {
          include: {
            workshop: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching VEP participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VEP participants' },
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

    const participant = await prisma.vepParticipant.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        role: body.role,
        roleDetail: body.roleDetail || null,
        mentorId: body.mentorId || null,
      },
    });

    revalidateAll();
    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error creating VEP participant:', error);
    return NextResponse.json(
      { error: 'Failed to create VEP participant' },
      { status: 500 }
    );
  }
}
