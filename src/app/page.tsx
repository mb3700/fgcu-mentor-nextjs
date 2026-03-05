import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import type { StatsData } from '@/types';

export const revalidate = 60;

export default async function DashboardPage() {
  const activeFilter = { status: { not: 'Pending Approval' } };
  const now = new Date();

  // Run all queries in parallel — replaces 3 sequential client-side API calls
  const [
    total, available, pending, speakers, judges, alumni, veterans,
    programRows, domainRows, sectorRows, workStatusRows,
    upcomingSessions, upcomingWorkshops,
  ] = await Promise.all([
    // Stats counts
    prisma.mentor.count({ where: activeFilter }),
    prisma.mentor.count({ where: { status: 'Available' } }),
    prisma.mentor.count({ where: { status: 'Pending Approval' } }),
    prisma.mentor.count({ where: { ...activeFilter, potentialSpeaker: true } }),
    prisma.mentor.count({ where: { ...activeFilter, potentialJudge: true } }),
    prisma.mentor.count({ where: { ...activeFilter, fgcuAlumni: true } }),
    prisma.mentor.count({ where: { ...activeFilter, veteranStatus: true } }),
    // Array field breakdowns (raw SQL with unnest for PostgreSQL)
    prisma.$queryRaw<{ value: string; count: bigint }[]>`
      SELECT unnest(programs) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `,
    prisma.$queryRaw<{ value: string; count: bigint }[]>`
      SELECT unnest(domain_expertise) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `,
    prisma.$queryRaw<{ value: string; count: bigint }[]>`
      SELECT unnest(sector_expertise) as value, COUNT(*) as count
      FROM mentors
      WHERE status != 'Pending Approval'
      GROUP BY value
      ORDER BY count DESC
    `,
    prisma.mentor.groupBy({
      by: ['workStatus'],
      where: activeFilter,
      _count: { _all: true },
      orderBy: { _count: { workStatus: 'desc' } },
    }),
    // Upcoming circle sessions — only future non-cancelled, limit 3
    prisma.circleSession.findMany({
      where: { date: { gte: now }, cancelled: false },
      include: { circle: { select: { name: true, startTime: true, endTime: true } } },
      orderBy: { date: 'asc' },
      take: 3,
    }),
    // Upcoming VEP workshops — only future non-cancelled, limit 3
    prisma.vepWorkshop.findMany({
      where: { date: { gte: now }, cancelled: false },
      orderBy: { date: 'asc' },
      take: 3,
    }),
  ]);

  // Convert raw rows to Record<string, number>
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

  return (
    <>
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-fgcu-gold text-xs font-semibold tracking-wider uppercase mb-4">
              <span className="pulse-dot w-2 h-2 bg-fgcu-gold rounded-full mr-2" />
              Mentor Network Active
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Mentor <span className="text-fgcu-gold">Directory</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Daveler &amp; Kauanui School of Entrepreneurship — connecting students
              with industry leaders who fuel innovation.
            </p>

            {/* Quick Search — uncontrolled input (no client state needed) */}
            <form action="/mentors" method="GET" className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search mentors by name, company, or expertise..."
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fgcu-gold focus:bg-white/15 text-sm backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-fgcu-gold hover:bg-fgcu-gold-light text-fgcu-blue font-semibold px-3 sm:px-6 py-2.5 rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto stagger-in">
            {[
              { value: stats.total, label: 'Total Mentors', color: 'text-white' },
              { value: stats.available, label: 'Available', color: 'text-fgcu-green-light' },
              { value: stats.speakers, label: 'Speakers', color: 'text-fgcu-gold' },
              { value: stats.judges, label: 'Judges', color: 'text-white' },
            ].map(({ value, label, color }) => (
              <div key={label} className="stat-card rounded-2xl p-5 text-center">
                <div className={`text-2xl sm:text-3xl font-extrabold ${color}`}>{value}</div>
                <div className="text-xs text-white/60 font-medium mt-1 uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts programs={stats.programs} domains={stats.domains} sectors={stats.sectors} />

      {/* Upcoming Circles */}
      {upcomingSessions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <Link href="/circles" className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-blue block hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
                Upcoming Mentor Circles
              </h3>
              <span className="text-xs text-fgcu-blue font-semibold group-hover:text-fgcu-gold transition-colors">
                View All &rarr;
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-fgcu-blue/5 rounded-xl">
                  <div className="w-10 h-10 bg-fgcu-blue/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-fgcu-blue uppercase leading-tight">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-extrabold text-fgcu-blue leading-tight">
                      {new Date(session.date).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fgcu-blue truncate">{session.circle?.name}</p>
                    <p className="text-xs text-gray-500">{session.circle?.startTime} – {session.circle?.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        </div>
      )}

      {/* Upcoming VEP Workshops */}
      {upcomingWorkshops.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Link href="/veterans-program" className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-green block hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
                Upcoming VEP Workshops
              </h3>
              <span className="text-xs text-fgcu-blue font-semibold group-hover:text-fgcu-gold transition-colors">
                View Program &rarr;
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingWorkshops.map((workshop) => (
                <div key={workshop.id} className="flex items-center gap-3 p-3 bg-fgcu-green/5 rounded-xl">
                  <div className="w-10 h-10 bg-fgcu-green/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-fgcu-green uppercase leading-tight">
                      {new Date(workshop.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-extrabold text-fgcu-green leading-tight">
                      {new Date(workshop.date).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fgcu-blue truncate">{workshop.topic}</p>
                    <p className="text-xs text-gray-500">Monday 9:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        </div>
      )}

      {/* Runway Program */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-gold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
              Runway Program
            </h3>
            <Link
              href="/runway-program"
              className="text-xs text-fgcu-blue font-semibold hover:text-fgcu-gold transition-colors"
            >
              View Program &rarr;
            </Link>
          </div>
          <div className="flex items-center gap-3 p-3 bg-fgcu-gold/5 rounded-xl">
            <div className="w-10 h-10 bg-fgcu-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-fgcu-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 italic">Mentoring events to be scheduled</p>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="mb-8" />
    </>
  );
}
