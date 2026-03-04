'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { StatsData } from '@/types';

export default function AdminOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-fgcu-blue border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Admin Overview</h1>

      {stats.pending > 0 && (
        <Link href="/admin/applications" className="block mb-6 p-4 bg-fgcu-gold/10 border border-fgcu-gold/30 rounded-xl hover:bg-fgcu-gold/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-fgcu-gold/20 rounded-lg flex items-center justify-center">
                <span className="text-fgcu-gold font-bold text-sm">{stats.pending}</span>
              </span>
              <div>
                <p className="text-sm font-bold text-fgcu-blue">Pending Applications</p>
                <p className="text-xs text-gray-500">New mentor applications awaiting review</p>
              </div>
            </div>
            <span className="text-fgcu-gold text-sm font-semibold">Review &rarr;</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Mentors', value: stats.total, color: 'border-fgcu-blue' },
          { label: 'Available', value: stats.available, color: 'border-fgcu-green' },
          { label: 'Speakers', value: stats.speakers, color: 'border-fgcu-gold' },
          { label: 'Judges', value: stats.judges, color: 'border-fgcu-blue' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`glass-card rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
            <p className="text-2xl font-extrabold text-fgcu-blue mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/mentors" className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <h3 className="font-bold text-fgcu-blue group-hover:text-fgcu-gold transition-colors">Manage Mentors</h3>
          <p className="text-sm text-gray-500 mt-1">View, edit, and delete mentors</p>
        </Link>
        <Link href="/admin/applications" className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <h3 className="font-bold text-fgcu-blue group-hover:text-fgcu-gold transition-colors">Applications</h3>
          <p className="text-sm text-gray-500 mt-1">Review pending mentor applications</p>
        </Link>
        <Link href="/admin/import" className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <h3 className="font-bold text-fgcu-blue group-hover:text-fgcu-gold transition-colors">Import Data</h3>
          <p className="text-sm text-gray-500 mt-1">Upload Excel file to import mentors</p>
        </Link>
        <Link href="/admin/export" className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <h3 className="font-bold text-fgcu-blue group-hover:text-fgcu-gold transition-colors">Export Data</h3>
          <p className="text-sm text-gray-500 mt-1">Download mentor data as CSV</p>
        </Link>
      </div>
    </div>
  );
}
