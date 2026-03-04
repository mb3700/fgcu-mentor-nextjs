import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { StatsData } from '@/types';

export async function GET() {
  try {
    const activeFilter = { status: { not: 'Pending Approval' } };

    // Basic counts (exclude pending)
    const [total, available, pending, speakers, judges, alumni, veterans] =
      await Promise.all([
        prisma.mentor.count({ where: activeFilter }),
        prisma.mentor.count({ where: { status: 'Available' } }),
        prisma.mentor.count({ where: { status: 'Pending Approval' } }),
        prisma.mentor.count({ where: { ...activeFilter, potentialSpeaker: true } }),
        prisma.mentor.count({ where: { ...activeFilter, potentialJudge: true } }),
        prisma.mentor.count({ where: { ...activeFilter, fgcuAlumni: true } }),
        prisma.mentor.count({ where: { ...activeFilter, veteranStatus: true } }),
      ]);

    // Array field breakdowns using raw SQL with unnest for PostgreSQL (exclude pending)
    const programRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(programs) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `;

    const domainRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(domain_expertise) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `;

    const sectorRows = await prisma.$queryRaw<
      { value: string; count: bigint }[]
    >`
      SELECT unnest(sector_expertise) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `;

    // Work status breakdown (exclude pending)
    const workStatusRows = await prisma.mentor.groupBy({
      by: ['workStatus'],
      where: activeFilter,
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
      pending,
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
