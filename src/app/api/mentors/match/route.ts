import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchMentors } from '@/lib/matching';
import type { Mentor, MatchRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();

    if (!body.domainExpertise || !body.sectorExpertise) {
      return NextResponse.json(
        { error: 'domainExpertise and sectorExpertise are required' },
        { status: 400 }
      );
    }

    // Fetch all available mentors
    const dbMentors = await prisma.mentor.findMany({
      where: { status: 'Available' },
    });

    // Convert Prisma results to Mentor type for the matching algorithm
    const mentors: Mentor[] = dbMentors.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    const results = matchMentors(mentors, body);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error matching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to match mentors' },
      { status: 500 }
    );
  }
}
