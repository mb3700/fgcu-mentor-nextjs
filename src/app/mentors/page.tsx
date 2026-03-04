'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MentorFilters } from '@/components/mentors/MentorFilters';
import { MentorGrid } from '@/components/mentors/MentorGrid';
import type { Mentor } from '@/types';

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/mentors?${params.toString()}`);
      const data = await res.json();
      setMentors(data.mentors || []);
      setTotal(data.total || 0);
      setLoading(false);
    };
    fetchMentors();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-fgcu-blue">Mentor Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing <span className="font-semibold text-fgcu-blue">{total}</span>{' '}
            mentor{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/match"
            className="inline-flex items-center px-5 py-2.5 bg-fgcu-gold hover:bg-fgcu-gold-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find a Mentor
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <MentorFilters />
        </div>

        {/* Mentor Grid */}
        <div className="flex-1">
          <MentorGrid mentors={mentors} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-8 w-48 skeleton rounded" /></div>}>
      <DirectoryContent />
    </Suspense>
  );
}
