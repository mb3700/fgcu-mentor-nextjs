import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Mentor } from '@/types';

export function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="mentor-card glass-card rounded-2xl p-5 shadow-md block"
    >
      <div className="flex items-start space-x-4">
        <Avatar name={mentor.name} size="md" photoUrl={mentor.photoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-fgcu-blue truncate">{mentor.name}</h3>
          {mentor.title && (
            <p className="text-xs text-gray-500 truncate">{mentor.title}</p>
          )}
          {mentor.businessName && (
            <p className="text-xs text-fgcu-green font-medium truncate">
              {mentor.businessName}
            </p>
          )}
        </div>
      </div>

      {/* Status & Flags */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {mentor.status === 'Available' && (
          <Badge variant="green">Available</Badge>
        )}
        {mentor.fgcuAlumni && <Badge variant="blue">Alumni</Badge>}
        {mentor.veteranStatus && <Badge variant="blue">Veteran</Badge>}
        {mentor.potentialSpeaker && <Badge variant="gold">Speaker</Badge>}
        {mentor.potentialJudge && <Badge variant="gold">Judge</Badge>}
      </div>

      {/* Programs */}
      {mentor.programs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {mentor.programs.map((prog) => (
            <span
              key={prog}
              className="tag-badge bg-fgcu-blue/5 text-fgcu-blue/80 border border-fgcu-blue/10"
            >
              {prog}
            </span>
          ))}
        </div>
      )}

      {/* Domain Expertise */}
      {mentor.domainExpertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {mentor.domainExpertise.slice(0, 4).map((domain) => (
            <Badge key={domain} variant="gray">{domain}</Badge>
          ))}
          {mentor.domainExpertise.length > 4 && (
            <Badge variant="gray">+{mentor.domainExpertise.length - 4}</Badge>
          )}
        </div>
      )}
    </Link>
  );
}
