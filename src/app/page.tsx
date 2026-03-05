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
            <a
              href="https://www.fgcu.edu/school-of-entrepreneurship/ife/runway-program"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-fgcu-blue font-semibold hover:text-fgcu-gold transition-colors"
            >
              Learn More &rarr;
            </a>
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

      {/* Quick Access Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">FGCU Alumni Mentors</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-fgcu-blue mt-1">{stats.alumni}</p>
                </div>
                <div className="w-12 h-12 bg-fgcu-green/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-fgcu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-blue">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Veteran Mentors</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-fgcu-blue mt-1">{stats.veterans}</p>
                </div>
                <div className="w-12 h-12 bg-fgcu-blue/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-fgcu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            <Link href="/mentors" className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-fgcu-gold group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Browse All Mentors</p>
                  <p className="text-lg font-bold text-fgcu-blue mt-1 group-hover:text-fgcu-gold transition-colors">
                    View Directory &rarr;
                  </p>
                </div>
                <div className="w-12 h-12 bg-fgcu-gold/10 rounded-xl flex items-center justify-center group-hover:bg-fgcu-gold/20 transition-colors">
                  <svg className="w-6 h-6 text-fgcu-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
