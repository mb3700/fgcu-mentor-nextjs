import type { Mentor, MatchRequest, MatchResult } from '@/types';

const DOMAIN_WEIGHT = 3;
const SECTOR_WEIGHT = 2;
const PROGRAM_WEIGHT = 1;

export function matchMentors(mentors: Mentor[], request: MatchRequest): MatchResult[] {
  const { domainExpertise, sectorExpertise, programs = [] } = request;

  const maxPossibleScore =
    domainExpertise.length * DOMAIN_WEIGHT +
    sectorExpertise.length * SECTOR_WEIGHT +
    programs.length * PROGRAM_WEIGHT;

  if (maxPossibleScore === 0) return [];

  const results: MatchResult[] = [];

  for (const mentor of mentors) {
    if (mentor.status !== 'Available') continue;

    const matchedDomains = domainExpertise.filter((d) =>
      mentor.domainExpertise.includes(d)
    );
    const matchedSectors = sectorExpertise.filter((s) =>
      mentor.sectorExpertise.includes(s)
    );
    const matchedPrograms = programs.filter((p) =>
      mentor.programs.includes(p)
    );

    const score =
      matchedDomains.length * DOMAIN_WEIGHT +
      matchedSectors.length * SECTOR_WEIGHT +
      matchedPrograms.length * PROGRAM_WEIGHT;

    if (score > 0) {
      results.push({
        mentor,
        score,
        matchedDomains,
        matchedSectors,
        matchedPrograms,
        matchPercentage: Math.round((score / maxPossibleScore) * 100),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  const limit = request.limit || 20;
  return results.slice(0, limit);
}
