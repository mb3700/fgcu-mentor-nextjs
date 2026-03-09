import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Runway Program | FGCU Mentor Directory',
  description:
    'Open drop-in mentoring at the Daveler & Kauanui School of Entrepreneurship Incubator.',
};

export default async function RunwayProgramPage() {
  const mentors = await prisma.mentor.findMany({
    where: {
      programs: { has: 'Runway Program' },
      status: 'Active',
    },
    orderBy: { name: 'asc' },
  });

  const events = await prisma.runwayEvent.findMany({
    where: {
      cancelled: false,
      date: { gte: new Date() },
    },
    orderBy: { date: 'asc' },
    take: 10,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="hero-gradient rounded-2xl px-6 sm:px-10 py-8 sm:py-12 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="pulse-dot w-2.5 h-2.5 rounded-full bg-fgcu-gold"></span>
          <span className="text-xs font-semibold text-fgcu-gold uppercase tracking-wider">
            Mentor Program
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Runway <span className="text-fgcu-gold">Program</span>
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl text-base sm:text-lg">
          Open drop-in mentoring at the Daveler &amp; Kauanui School of
          Entrepreneurship Incubator.
        </p>
      </div>

      {/* Mentoring Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-fgcu-blue mb-6">
          Upcoming Events
        </h2>

        {events.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-fgcu-gold/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-fgcu-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 italic">
                No upcoming events scheduled
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              return (
                <div
                  key={event.id}
                  className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-fgcu-blue/10 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-fgcu-blue uppercase">
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-extrabold text-fgcu-blue leading-none">
                        {eventDate.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Program Mentors */}
      <section>
        <h2 className="text-2xl font-bold text-fgcu-blue mb-6">
          Program Mentors ({mentors.length})
        </h2>

        {mentors.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-500 italic">
              No mentors assigned to this program yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <Link
                key={mentor.id}
                href={`/mentors/${mentor.id}`}
                className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={mentor.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-fgcu-blue transition-colors truncate">
                      {mentor.name}
                    </p>
                    {mentor.title && (
                      <p className="text-xs text-gray-500 truncate">
                        {mentor.title}
                      </p>
                    )}
                    {mentor.businessName && (
                      <p className="text-xs text-gray-400 truncate">
                        {mentor.businessName}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
