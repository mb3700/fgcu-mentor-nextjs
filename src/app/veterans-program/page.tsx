import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { VepRoleBadge } from '@/components/veterans/VepRoleBadge';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Veterans Entrepreneurship Program | FGCU Mentor Directory',
  description:
    'Supporting veteran entrepreneurs through expert mentoring, workshops, and professional development.',
};

export default async function VeteransProgramPage() {
  const currentSemester = 'Spring 2026';

  const workshops = await prisma.vepWorkshop.findMany({
    where: { semester: currentSemester },
    include: {
      assignments: {
        include: {
          participant: {
            include: { mentor: true },
          },
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  const participants = await prisma.vepParticipant.findMany({
    where: { isActive: true },
    include: { mentor: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const now = new Date();

  const mentors = participants.filter((p) => p.role === 'mentor');
  const speakers = participants.filter((p) => p.role === 'speaker');
  const judges = participants.filter((p) => p.role === 'judge');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="hero-gradient rounded-2xl px-6 sm:px-10 py-8 sm:py-12 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="pulse-dot w-2.5 h-2.5 rounded-full bg-fgcu-green"></span>
          <span className="text-xs font-semibold text-fgcu-green uppercase tracking-wider">
            {currentSemester}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Veterans Florida{' '}
          <span className="text-fgcu-gold">Entrepreneurship Program</span>
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl text-base sm:text-lg">
          Supporting veteran entrepreneurs through expert mentoring, workshops,
          and professional development.
        </p>
      </div>

      {/* Workshop Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-fgcu-blue mb-6">
          Workshop Schedule
        </h2>

        {workshops.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-500">
              No workshops scheduled for {currentSemester}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.map((workshop) => {
              const workshopDate = new Date(workshop.date);
              const isUpcoming = workshopDate > now;

              // Group assignments by participant role
              const assignmentsByRole: Record<
                string,
                typeof workshop.assignments
              > = {};
              for (const assignment of workshop.assignments) {
                const role = assignment.participant.role;
                if (!assignmentsByRole[role]) {
                  assignmentsByRole[role] = [];
                }
                assignmentsByRole[role].push(assignment);
              }

              return (
                <div
                  key={workshop.id}
                  className={`glass-card rounded-2xl p-5 sm:p-6 border transition-all ${
                    workshop.cancelled
                      ? 'bg-red-50 border-red-200 opacity-75'
                      : isUpcoming
                      ? 'bg-white border-gray-100'
                      : 'bg-gray-50 border-gray-100 opacity-70'
                  }`}
                >
                  {/* Workshop Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold ${
                          isUpcoming && !workshop.cancelled
                            ? 'text-fgcu-blue'
                            : 'text-gray-500'
                        }`}
                      >
                        {workshopDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {workshop.cancelled ? (
                        <Badge variant="red">Cancelled</Badge>
                      ) : isUpcoming ? (
                        <Badge variant="green">Upcoming</Badge>
                      ) : (
                        <Badge variant="gray">Past</Badge>
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-bold mb-3 ${
                      workshop.cancelled
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {workshop.topic}
                  </h3>

                  {workshop.notes && !workshop.cancelled && (
                    <p className="text-sm text-gray-500 mb-3">
                      {workshop.notes}
                    </p>
                  )}

                  {/* Participants grouped by role */}
                  {!workshop.cancelled && (
                    <div>
                      {workshop.assignments.length === 0 ? (
                        <span className="text-sm text-gray-400 italic">
                          No participants assigned yet
                        </span>
                      ) : (
                        <div className="space-y-3">
                          {(['mentor', 'speaker', 'judge'] as const).map(
                            (role) => {
                              const roleAssignments =
                                assignmentsByRole[role] || [];
                              if (roleAssignments.length === 0) return null;

                              return (
                                <div key={role}>
                                  <div className="mb-1.5">
                                    <VepRoleBadge role={role} />
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {roleAssignments.map((assignment) => {
                                      const fullName = `${assignment.participant.firstName} ${assignment.participant.lastName}`;
                                      const mentorId =
                                        assignment.participant.mentorId;

                                      const content = (
                                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100 hover:border-fgcu-blue/30 hover:shadow-sm transition-all group">
                                          <Avatar name={fullName} size="sm" />
                                          <span className="text-sm font-medium text-gray-700 group-hover:text-fgcu-blue transition-colors">
                                            {fullName}
                                          </span>
                                        </div>
                                      );

                                      return mentorId ? (
                                        <Link
                                          key={assignment.id}
                                          href={`/mentors/${mentorId}`}
                                        >
                                          {content}
                                        </Link>
                                      ) : (
                                        <div key={assignment.id}>{content}</div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Program Roster */}
      <section>
        <h2 className="text-2xl font-bold text-fgcu-blue mb-6">
          Program Roster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mentors Column */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold text-fgcu-blue mb-4">
              Mentors ({mentors.length})
            </h3>
            <div className="space-y-3">
              {mentors.map((participant) => {
                const fullName = `${participant.firstName} ${participant.lastName}`;
                const inner = (
                  <div className="flex items-center gap-3 group">
                    <Avatar name={fullName} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-fgcu-blue transition-colors block">
                        {fullName}
                      </span>
                      {participant.roleDetail && (
                        <span className="text-xs text-gray-400">
                          {participant.roleDetail}
                        </span>
                      )}
                    </div>
                  </div>
                );

                return participant.mentorId ? (
                  <Link
                    key={participant.id}
                    href={`/mentors/${participant.mentorId}`}
                    className="block hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={participant.id}
                    className="px-2 py-1.5 -mx-2"
                  >
                    {inner}
                  </div>
                );
              })}
              {mentors.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No mentors assigned yet
                </p>
              )}
            </div>
          </div>

          {/* Speakers Column */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold text-fgcu-gold mb-4">
              Speakers ({speakers.length})
            </h3>
            <div className="space-y-3">
              {speakers.map((participant) => {
                const fullName = `${participant.firstName} ${participant.lastName}`;
                const inner = (
                  <div className="flex items-center gap-3 group">
                    <Avatar name={fullName} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-fgcu-blue transition-colors block">
                        {fullName}
                      </span>
                      {participant.roleDetail && (
                        <span className="text-xs text-gray-400">
                          {participant.roleDetail}
                        </span>
                      )}
                    </div>
                  </div>
                );

                return participant.mentorId ? (
                  <Link
                    key={participant.id}
                    href={`/mentors/${participant.mentorId}`}
                    className="block hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={participant.id}
                    className="px-2 py-1.5 -mx-2"
                  >
                    {inner}
                  </div>
                );
              })}
              {speakers.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No speakers assigned yet
                </p>
              )}
            </div>
          </div>

          {/* Judges Column */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold text-fgcu-green mb-4">
              Judges ({judges.length})
            </h3>
            <div className="space-y-3">
              {judges.map((participant) => {
                const fullName = `${participant.firstName} ${participant.lastName}`;
                const inner = (
                  <div className="flex items-center gap-3 group">
                    <Avatar name={fullName} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-fgcu-blue transition-colors block">
                        {fullName}
                      </span>
                      {participant.roleDetail && (
                        <span className="text-xs text-gray-400">
                          {participant.roleDetail}
                        </span>
                      )}
                    </div>
                  </div>
                );

                return participant.mentorId ? (
                  <Link
                    key={participant.id}
                    href={`/mentors/${participant.mentorId}`}
                    className="block hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={participant.id}
                    className="px-2 py-1.5 -mx-2"
                  >
                    {inner}
                  </div>
                );
              })}
              {judges.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No judges assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
