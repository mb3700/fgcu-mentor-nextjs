import { MentorCard } from './MentorCard';
import type { Mentor } from '@/types';

interface MentorGridProps {
  mentors: Mentor[];
  loading?: boolean;
}

export function MentorGrid({ mentors, loading }: MentorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded skeleton" />
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-3 w-28 rounded skeleton" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="h-5 w-16 rounded-full skeleton" />
              <div className="h-5 w-14 rounded-full skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700">No mentors found</h3>
        <p className="text-sm text-gray-500 mt-1">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-in">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}
