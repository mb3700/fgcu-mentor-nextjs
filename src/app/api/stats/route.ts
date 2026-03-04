import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { StatsData } from '@/types';

export async function GET() {
  try {
    // Basic counts
    const [total, available, speakers, judges, alumni, veterans] =
      await Promise.all([
        prisma.mentor.count(),
        prisma.mentor.count({ where: { status: 'Available' } }),
        prisma.mentor.count({ where: { potentialSpeaker: true } }),
        prisma.mentor.count({ where: { potentialJudge: true } }),
        prisma.mentor.count({ where: { fgcuAlumni: true } }),
        prisma.mentor.count({ where: { veteranStatus: true } }),
      ]);

    // Array field breakdowns using raw SQL with unnest for PostgreSQL
    const programRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(programs) as value, COUNT(*) as count
      FROM mentors
      GROUP BY value
      ORDER BY count DESC
    `;

    const domainRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(domain_expertise) as value, COUNT(*) as count
      FROM mentors
      GROUP BY value
      ORDER BY count DESC
    `;

    const sectorRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(sector_expertise) as value, COUNT(*) as count
      FROM mentors
      GROUP BY value
      ORDER BY count DESC
    `;

    // Work status breakdown using standard Prisma groupBy
    const workStatusRows = await prisma.mentor.groupBy({
      by: ['workStatus'],
      _count: { _all: true },
      orderBy: { _count: { workStatus: 'desc' } },
    });

    // Convert to Record<string, number>
    const programs: Record<string, number> = {};
    for (const row of programRows) {
      programs[row.value] = Number(row.count);
    }

    const domains: Record<string, number> = {};
    for (const row of domainRows) {
      domains[row.value] = Number(row.count);
    }

    const sectors: Record<string, number> = {};
    for (const row of sectorRows) {
      sectors[row.value] = Number(row.count);
    }

    const workStatuses: Record<string, number> = {};
    for (const row of workStatusRows) {
      const key = row.workStatus || 'Unknown';
      workStatuses[key] = row._count._all;
    }

    const stats: StatsData = {
      total,
      available,
      speakers,
      judges,
      alumni,
      veterans,
      programs,
      domains,
      sectors,
      workStatuses,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
