import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const program = searchParams.get('program') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const status = searchParams.get('status') || undefined;
    const workStatus = searchParams.get('workStatus') || undefined;
    const alumni = searchParams.get('alumni');
    const veteran = searchParams.get('veteran');
    const speaker = searchParams.get('speaker');
    const judge = searchParams.get('judge');
    const sort = searchParams.get('sort') || 'name';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Prisma.MentorWhereInput = {};

    // Text search across name, businessName, title, biography
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { biography: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Array field filters using hasSome
    if (program) {
      where.programs = { hasSome: [program] };
    }
    if (domain) {
      where.domainExpertise = { hasSome: [domain] };
    }
    if (sector) {
      where.sectorExpertise = { hasSome: [sector] };
    }

    // Scalar filters
    const includePending = searchParams.get('includePending') === 'true';
    if (status) {
      where.status = status;
    } else if (!includePending) {
      where.status = { not: 'Pending Approval' };
    }
    if (workStatus) {
      where.workStatus = workStatus;
    }
    if (alumni === 'true') {
      where.fgcuAlumni = true;
    }
    if (veteran === 'true') {
      where.veteranStatus = true;
    }
    if (speaker === 'true') {
      where.potentialSpeaker = true;
    }
    if (judge === 'true') {
      where.potentialJudge = true;
    }

    // Determine sort order
    let orderBy: Prisma.MentorOrderByWithRelationInput = { name: 'asc' };
    if (sort === 'name') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'createdAt') orderBy = { createdAt: 'desc' };
    else if (sort === 'updatedAt') orderBy = { updatedAt: 'desc' };
    else if (sort === 'status') orderBy = { status: 'asc' };

    const skip = (page - 1) * limit;

    const [mentors, total] = await Promise.all([
      prisma.mentor.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.mentor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ mentors, total, page, totalPages });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
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

    const mentor = await prisma.mentor.create({
      data: {
        name: body.name,
        status: body.status || 'Available',
        businessName: body.businessName || null,
        title: body.title || null,
        location: body.location || null,
        phone: body.phone || null,
        email: body.email || null,
        biography: body.biography || null,
        fgcuAlumni: body.fgcuAlumni || false,
        domainExpertise: body.domainExpertise || [],
        sectorExpertise: body.sectorExpertise || [],
        programs: body.programs || [],
        workStatus: body.workStatus || null,
        potentialSpeaker: body.potentialSpeaker || false,
        potentialJudge: body.potentialJudge || false,
        mentorCoordinator: body.mentorCoordinator || null,
        veteranStatus: body.veteranStatus || false,
        photoUrl: body.photoUrl || null,
      },
    });

    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to create mentor' },
      { status: 500 }
    );
  }
}
