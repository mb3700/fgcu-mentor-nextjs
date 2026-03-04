import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCSV } from '@/lib/excel';
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
    const format = searchParams.get('format') || 'csv';

    const where: Prisma.MentorWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { biography: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (program) {
      where.programs = { hasSome: [program] };
    }
    if (domain) {
      where.domainExpertise = { hasSome: [domain] };
    }
    if (sector) {
      where.sectorExpertise = { hasSome: [sector] };
    }
    if (status) {
      where.status = status;
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

    const mentors = await prisma.mentor.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (format === 'csv') {
      const csv = generateCSV(mentors);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="mentors-export.csv"',
        },
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error exporting mentors:', error);
    return NextResponse.json(
      { error: 'Failed to export mentors' },
      { status: 500 }
    );
  }
}
