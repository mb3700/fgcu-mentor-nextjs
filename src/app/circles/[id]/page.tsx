import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { AttendanceBadge } from '@/components/circles/AttendanceBadge';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const circle = await prisma.mentorCircle.findUnique({
    where: { id: parseInt(id, 10) },
  });

  return {
    title: circle
      ? `${circle.name} | FGCU Mentor Circles`
      : 'Circle Not Found',
  };
}

export default async function CircleDetailPage({ params }: Props) {
  const { id } = await params;
  const circleId = parseInt(id, 10);

  if (isNaN(circleId)) notFound();

  const circle = await prisma.mentorCircle.findUnique({
    where: { id: circleId },
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
  });

  if (!circle) notFound();

  const now = new Date();

  // Count unique mentors across all sessions
  const uniqueMentorIds = new Set(
    circle.sessions.flatMap((s) => s.attendees.map((a) => a.mentorId))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button */}
      <Link
        href="/circles"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-fgcu-blue mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Mentor Circles
      </Link>

      {/* Hero Header */}
      <div className="hero-gradient rounded-2xl px-6 sm:px-8 py-8 sm:py-10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{circle.name}</h1>
            <p className="text-white/80 mt-2">
              Coordinated by <span className="font-semibold text-white">{circle.coordinator}</span>
            </p>
            {circle.location && (
              <p className="text-white/70 text-sm mt-1">📍 {circle.location}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold" size="md">{circle.dayOfWeek}s</Badge>
            <Badge variant="blue" size="md">{circle.startTime} – {circle.endTime}</Badge>
            <Badge variant="green" size="md">{circle.semester}</Badge>
          </div>
        </div>
        <div className="flex gap-6 mt-6 text-white/90 text-sm">
          <span><strong className="text-white">{circle.sessions.length}</strong> Sessions</span>
          <span><strong className="text-white">{uniqueMentorIds.size}</strong> Mentors</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">Session Schedule</h2>

        {circle.sessions.map((session) => {
          const sessionDate = new Date(session.date);
          const isPast = sessionDate < now;
          const isNext = !isPast && circle.sessions.filter(s => new Date(s.date) >= now)[0]?.id === session.id;

          return (
            <div
              key={session.id}
              className={`glass-card rounded-2xl overflow-hidden ${
                session.cancelled ? 'opacity-60' : isPast ? 'opacity-75' : ''
              }`}
            >
              {/* Session Header */}
              <div className={`px-6 py-4 border-b ${
                isNext
                  ? 'bg-fgcu-blue/5 border-fgcu-blue/10'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    {isNext && (
                      <span className="pulse-dot w-2.5 h-2.5 rounded-full bg-fgcu-green flex-shrink-0"></span>
                    )}
                    <h3 className={`text-lg font-bold ${isPast ? 'text-gray-500' : 'text-fgcu-blue'}`}>
                      {sessionDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {session.cancelled && <Badge variant="red">Cancelled</Badge>}
                    {isNext && <Badge variant="green">Next Session</Badge>}
                    <span className="text-sm text-gray-500">
                      {session.attendees.length} mentor{session.attendees.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {session.notes && (
                  <p className="text-sm text-gray-500 italic mt-1">{session.notes}</p>
                )}
              </div>

              {/* Attendees */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {session.attendees.map((attendee) => (
                    <Link
                      key={attendee.id}
                      href={`/mentors/${attendee.mentor.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-fgcu-blue/5 border border-gray-100 hover:border-fgcu-blue/20 transition-all group"
                    >
                      <Avatar name={attendee.mentor.name} size="sm" photoUrl={attendee.mentor.photoUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-800 group-hover:text-fgcu-blue transition-colors truncate">
                          {attendee.mentor.name}
                        </p>
                        {attendee.mentor.title && (
                          <p className="text-xs text-gray-500 truncate">{attendee.mentor.title}</p>
                        )}
                      </div>
                      <AttendanceBadge status={attendee.status} />
                    </Link>
                  ))}
                </div>
                {session.attendees.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">No mentors assigned yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {circle.notes && (
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">Notes</h2>
          <p className="text-gray-600">{circle.notes}</p>
        </div>
      )}
    </div>
  );
}
