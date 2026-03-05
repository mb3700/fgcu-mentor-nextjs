'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { StatsData, CircleSession, VepWorkshop } from '@/types';

const ProgramChart = dynamic(() => import('@/components/dashboard/ProgramChart'), { ssr: false });
const DomainChart = dynamic(() => import('@/components/dashboard/DomainChart'), { ssr: false });
const SectorChart = dynamic(() => import('@/components/dashboard/SectorChart'), { ssr: false });

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingSessions, setUpcomingSessions] = useState<(CircleSession & { circle?: { name: string; startTime: string; endTime: string } })[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<VepWorkshop[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats);

    // Fetch upcoming circle sessions
    fetch('/api/circles')
      .then((r) => r.json())
      .then((circles) => {
        const now = new Date();
        const allSessions: (CircleSession & { circle?: { name: string; startTime: string; endTime: string } })[] = [];
        for (const circle of circles) {
          for (const session of circle.sessions || []) {
            if (new Date(session.date) >= now && !session.cancelled) {
              allSessions.push({ ...session, circle: { name: circle.name, startTime: circle.startTime, endTime: circle.endTime } });
            }
          }
        }
        allSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingSessions(allSessions.slice(0, 3));
      })
      .catch(() => {});

    // Fetch upcoming VEP workshops
    fetch('/api/veterans-program')
      .then((r) => r.json())
      .then((workshops: VepWorkshop[]) => {
        const now = new Date();
        const upcoming = workshops
          .filter((w) => new Date(w.date) >= now && !w.cancelled)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setUpcomingWorkshops(upcoming);
      })
      .catch(() => {});
  }, []);

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

            {/* Quick Search */}
            <form action="/mentors" method="GET" className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          {stats && (
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
          )}
        </div>
      </div>

      {/* Charts Section */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:-mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
              <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
                Mentors by Program
              </h3>
              <div className="relative" style={{ height: 260 }}>
                <ProgramChart data={stats.programs} />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
              <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
                Domain Expertise
              </h3>
              <div className="relative" style={{ height: 260 }}>
                <DomainChart data={stats.domains} />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
              <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
                Sector Coverage
              </h3>
              <div className="relative" style={{ height: 260 }}>
                <SectorChart data={stats.sectors} />
              </div>
            </div>
          </div>
        </div>
      )}

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
