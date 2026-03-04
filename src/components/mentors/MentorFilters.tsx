'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { PROGRAMS, DOMAIN_OPTIONS, SECTOR_OPTIONS, WORK_STATUS_OPTIONS } from '@/lib/constants';

export function MentorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/mentors?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateFilter('search', search);
  }, [search, updateFilter]);

  const clearFilters = useCallback(() => {
    router.push('/mentors');
    setSearch('');
  }, [router]);

  const getVal = (key: string) => searchParams.get(key) || '';

  return (
    <div className="glass-card rounded-2xl p-5 shadow-lg sticky top-24 space-y-5">
      <h3 className="text-xs font-bold text-fgcu-blue uppercase tracking-wider">
        Filters
      </h3>

      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Search
        </label>
        <div className="flex mt-1 gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Name, company, title..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Program */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Program
        </label>
        <select
          value={getVal('program')}
          onChange={(e) => updateFilter('program', e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue"
        >
          <option value="">All Programs</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Domain */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Domain Expertise
        </label>
        <select
          value={getVal('domain')}
          onChange={(e) => updateFilter('domain', e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue"
        >
          <option value="">All Domains</option>
          {DOMAIN_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Sector */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sector
        </label>
        <select
          value={getVal('sector')}
          onChange={(e) => updateFilter('sector', e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue"
        >
          <option value="">All Sectors</option>
          {SECTOR_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Work Status */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Work Status
        </label>
        <select
          value={getVal('workStatus')}
          onChange={(e) => updateFilter('workStatus', e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue"
        >
          <option value="">Any</option>
          {WORK_STATUS_OPTIONS.map((ws) => (
            <option key={ws} value={ws}>{ws}</option>
          ))}
        </select>
      </div>

      {/* Boolean Toggles */}
      <div className="space-y-2">
        {[
          { key: 'alumni', label: 'FGCU Alumni Only', color: 'fgcu-green' },
          { key: 'veteran', label: 'Veterans Only', color: 'fgcu-blue' },
          { key: 'speaker', label: 'Available as Speaker', color: 'fgcu-gold' },
          { key: 'judge', label: 'Available as Judge', color: 'fgcu-gold' },
        ].map(({ key, label, color }) => (
          <label key={key} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={getVal(key) === '1'}
              onChange={(e) => updateFilter(key, e.target.checked ? '1' : '')}
              className={`w-4 h-4 text-${color} rounded border-gray-300 focus:ring-${color}`}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={getVal('sort') || 'name'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue"
        >
          <option value="name">Name A-Z</option>
          <option value="recent">Recently Updated</option>
          <option value="business">Company A-Z</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="flex-1 bg-fgcu-blue hover:bg-fgcu-blue-light text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Apply
        </button>
        <button
          onClick={clearFilters}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
