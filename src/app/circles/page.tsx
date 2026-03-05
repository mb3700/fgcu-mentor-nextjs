import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Mentor Circles | FGCU Mentor Directory',
  description: 'View the Mentor Circle schedule for the Daveler & Kauanui School of Entrepreneurship',
};

export default async function CirclesPage() {
  // Get all semesters that have circles
  const semesters = await prisma.mentorCircle.findMany({
    select: { semester: true },
    distinct: ['semester'],
    orderBy: { semester: 'desc' },
  });

  const currentSemester = semesters[0]?.semester || 'Spring 2026';

  const circles = await prisma.mentorCircle.findMany({
    where: { semester: currentSemester },
    include: {
      sessions: {
        include: {
          attendees: {
            include: { mentor: true },
            orderBy: { mentor: { name: 'asc' } },
          },
        },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  const now = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="pulse-dot w-2.5 h-2.5 rounded-full bg-fgcu-green"></span>
          <span className="text-xs font-semibold text-fgcu-green uppercase tracking-wider">
            {currentSemester}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fgcu-blue">
          Mentor <span className="text-fgcu-gold">Circles</span>
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Mentor Circles bring experienced professionals into the classroom for small-group mentoring sessions with students.
        </p>
      </div>

      {/* Circles Grid */}
      {circles.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-gray-500">No Mentor Circles scheduled for {currentSemester}.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {circles.map((circle) => (
            <div key={circle.id} className="glass-card rounded-2xl shadow-lg overflow-hidden">
              {/* Circle Header */}
              <div className="hero-gradient px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <Link href={`/circles/${circle.id}`} className="hover:underline">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{circle.name}</h2>
                    </Link>
                    <p className="text-white/80 text-sm mt-1">
                      Coordinated by <span className="font-semibold text-white">{circle.coordinator}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-fgcu-gold/20 text-fgcu-gold border border-fgcu-gold/30">
                      {circle.dayOfWeek}s
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 text-white border border-white/20">
                      {circle.startTime} – {circle.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-4 sm:p-6 space-y-4">
                {circle.sessions.map((session) => {
                  const sessionDate = new Date(session.date);
                  const isPast = sessionDate < now;
                  const isNext = !isPast && circle.sessions.filter(s => new Date(s.date) >= now)[0]?.id === session.id;

                  return (
                    <div
                      key={session.id}
                      className={`rounded-xl p-4 border transition-all ${
                        session.cancelled
                          ? 'bg-red-50 border-red-200 opacity-75'
                          : isPast
                          ? 'bg-gray-50 border-gray-100 opacity-70'
                          : isNext
                          ? 'bg-fgcu-blue/5 border-fgcu-blue/20 ring-1 ring-fgcu-blue/10'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {isNext && (
                            <span className="pulse-dot w-2 h-2 rounded-full bg-fgcu-green flex-shrink-0"></span>
                          )}
                          <span className={`font-semibold ${isPast ? 'text-gray-500' : 'text-fgcu-blue'}`}>
                            {sessionDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {session.cancelled && (
                            <Badge variant="red">Cancelled</Badge>
                          )}
                          {isNext && (
                            <Badge variant="green">Upcoming</Badge>
                          )}
                        </div>
                        {session.notes && (
                          <span className="text-sm text-gray-500 italic">{session.notes}</span>
                        )}
                      </div>

                      {/* Mentor List */}
                      <div className="flex flex-wrap gap-2">
                        {session.attendees.map((attendee) => (
                          <Link
                            key={attendee.id}
                            href={`/mentors/${attendee.mentor.id}`}
                            className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100 hover:border-fgcu-blue/30 hover:shadow-sm transition-all group"
                          >
                            <Avatar name={attendee.mentor.name} size="sm" photoUrl={attendee.mentor.photoUrl} />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-fgcu-blue transition-colors">
                              {attendee.mentor.name}
                            </span>
                          </Link>
                        ))}
                        {session.attendees.length === 0 && (
                          <span className="text-sm text-gray-400 italic">No mentors assigned yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <Link
                  href={`/circles/${circle.id}`}
                  className="text-sm font-medium text-fgcu-blue hover:text-fgcu-gold transition-colors"
                >
                  View full details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
