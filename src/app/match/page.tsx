'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DOMAIN_OPTIONS, SECTOR_OPTIONS, PROGRAMS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { MatchResult } from '@/types';

export default function MatchPage() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleMatch = async () => {
    if (selectedDomains.length === 0 && selectedSectors.length === 0) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch('/api/mentors/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domainExpertise: selectedDomains,
        sectorExpertise: selectedSectors,
        programs: selectedPrograms,
      }),
    });
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-fgcu-blue">Find a Mentor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select the expertise you need and we&apos;ll match you with the best mentors.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Selection Form */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="glass-card rounded-2xl p-6 shadow-lg lg:sticky top-24 space-y-6">
            {/* Domain Expertise */}
            <div>
              <h3 className="text-xs font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                Domain Expertise Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(selectedDomains, setSelectedDomains, d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedDomains.includes(d)
                        ? 'bg-fgcu-green text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector Expertise */}
            <div>
              <h3 className="text-xs font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                Sector Expertise Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {SECTOR_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(selectedSectors, setSelectedSectors, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedSectors.includes(s)
                        ? 'bg-fgcu-gold text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Program Filter */}
            <div>
              <h3 className="text-xs font-bold text-fgcu-blue uppercase tracking-wider mb-3">
                Program (Optional)
              </h3>
              <div className="flex flex-wrap gap-2">
                {PROGRAMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => toggle(selectedPrograms, setSelectedPrograms, p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedPrograms.includes(p)
                        ? 'bg-fgcu-blue text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleMatch}
              disabled={selectedDomains.length === 0 && selectedSectors.length === 0}
              className="w-full bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              {loading ? <Spinner size="sm" /> : 'Find Best Mentors'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-gray-700">No matches found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try selecting different expertise areas.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4 stagger-in">
              <p className="text-sm text-gray-500 mb-4">
                Found <span className="font-semibold text-fgcu-blue">{results.length}</span> matching mentors
              </p>
              {results.map((result) => (
                <Link
                  key={result.mentor.id}
                  href={`/mentors/${result.mentor.id}`}
                  className="glass-card rounded-2xl p-5 shadow-md block mentor-card"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Match Score */}
                    <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center ${
                      result.matchPercentage >= 70
                        ? 'bg-fgcu-green/10 text-fgcu-green'
                        : result.matchPercentage >= 40
                        ? 'bg-fgcu-gold/15 text-fgcu-gold'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="text-lg sm:text-xl font-extrabold">{result.matchPercentage}%</span>
                      <span className="text-[10px] font-medium uppercase">Match</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Avatar name={result.mentor.name} size="sm" />
                        <div>
                          <h3 className="text-sm font-bold text-fgcu-blue">{result.mentor.name}</h3>
                          {result.mentor.title && (
                            <p className="text-xs text-gray-500">{result.mentor.title}</p>
                          )}
                          {result.mentor.businessName && (
                            <p className="text-xs text-fgcu-green font-medium">{result.mentor.businessName}</p>
                          )}
                        </div>
                      </div>

                      {/* Matched Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {result.matchedDomains.map((d) => (
                          <Badge key={d} variant="green">{d}</Badge>
                        ))}
                        {result.matchedSectors.map((s) => (
                          <Badge key={s} variant="gold">{s}</Badge>
                        ))}
                        {result.matchedPrograms.map((p) => (
                          <Badge key={p} variant="blue">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!searched && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-fgcu-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-fgcu-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700">Select expertise to find mentors</h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose the domain and sector expertise you&apos;re looking for, then click &quot;Find Best Mentors&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
