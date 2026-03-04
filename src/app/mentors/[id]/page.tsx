import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mentor = await prisma.mentor.findUnique({ where: { id: parseInt(id) } });
  if (!mentor) return { title: 'Mentor Not Found' };
  return {
    title: mentor.name,
    description: `${mentor.name}${mentor.title ? ` — ${mentor.title}` : ''}${mentor.businessName ? ` at ${mentor.businessName}` : ''}`,
  };
}

export default async function MentorProfilePage({ params }: Props) {
  const { id } = await params;
  const mentor = await prisma.mentor.findUnique({
    where: { id: parseInt(id) },
    include: { interactions: { orderBy: { date: 'desc' }, take: 20 } },
  });

  if (!mentor) notFound();
  if (mentor.status === 'Pending Approval') notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/mentors"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Directory
      </Link>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl shadow-lg overflow-hidden fade-in">
        {/* Hero Header */}
        <div className="hero-gradient px-4 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar name={mentor.name} size="lg" photoUrl={mentor.photoUrl} />
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white">{mentor.name}</h1>
              {mentor.title && (
                <p className="text-white/70 text-lg mt-1">{mentor.title}</p>
              )}
              {mentor.businessName && (
                <p className="text-fgcu-gold font-semibold mt-1">{mentor.businessName}</p>
              )}
            </div>
            <Link
              href={`/admin/mentors/${mentor.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            {mentor.status === 'Available' && (
              <span className="px-3 py-1 rounded-full bg-fgcu-green/20 text-white text-xs font-semibold border border-fgcu-green/30">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 pulse-dot" />
                Available
              </span>
            )}
            {mentor.workStatus && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/15">
                {mentor.workStatus}
              </span>
            )}
            {mentor.fgcuAlumni && (
              <span className="px-3 py-1 rounded-full bg-fgcu-gold/20 text-fgcu-gold text-xs font-semibold border border-fgcu-gold/30">
                FGCU Alumni
              </span>
            )}
            {mentor.veteranStatus && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/15">
                Veteran
              </span>
            )}
            {mentor.potentialSpeaker && (
              <span className="px-3 py-1 rounded-full bg-fgcu-gold/20 text-fgcu-gold text-xs font-semibold border border-fgcu-gold/30">
                Potential Speaker
              </span>
            )}
            {mentor.potentialJudge && (
              <span className="px-3 py-1 rounded-full bg-fgcu-gold/20 text-fgcu-gold text-xs font-semibold border border-fgcu-gold/30">
                Potential Judge
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Biography */}
              {mentor.biography && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Biography
                  </h2>
                  <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                    {mentor.biography.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Programs */}
              {mentor.programs.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Mentoring Programs
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.programs.map((prog) => (
                      <span
                        key={prog}
                        className="px-4 py-2 rounded-xl bg-fgcu-blue/5 text-fgcu-blue font-semibold text-sm border border-fgcu-blue/10"
                      >
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions */}
              {mentor.interactions && mentor.interactions.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Recent Interactions
                  </h2>
                  <div className="space-y-3">
                    {mentor.interactions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-lg bg-fgcu-blue/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-fgcu-blue uppercase">
                            {interaction.type[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {interaction.subject || interaction.type}
                          </p>
                          {interaction.notes && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {interaction.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(interaction.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                  Contact
                </h2>
                {mentor.email && (
                  <a
                    href={`mailto:${mentor.email}`}
                    className="flex items-center text-sm text-gray-700 hover:text-fgcu-blue mb-3 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{mentor.email}</span>
                  </a>
                )}
                {mentor.phone && (
                  <a
                    href={`tel:${mentor.phone}`}
                    className="flex items-center text-sm text-gray-700 hover:text-fgcu-blue mb-3 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {mentor.phone}
                  </a>
                )}
                {mentor.location && (
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {mentor.location}
                  </div>
                )}
                {!mentor.email && !mentor.phone && !mentor.location && (
                  <p className="text-sm text-gray-400 italic">No contact info on file</p>
                )}
              </div>

              {/* Domain Expertise */}
              {mentor.domainExpertise.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Domain Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.domainExpertise.map((d) => (
                      <Badge key={d} variant="green" size="md">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sector Expertise */}
              {mentor.sectorExpertise.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Sector Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.sectorExpertise.map((s) => (
                      <Badge key={s} variant="gold" size="md">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinator */}
              {mentor.mentorCoordinator && (
                <div>
                  <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                    Coordinator
                  </h2>
                  <p className="text-sm text-gray-700">{mentor.mentorCoordinator}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
