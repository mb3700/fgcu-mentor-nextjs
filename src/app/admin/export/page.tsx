'use client';

import { useState, useEffect } from 'react';
import { PROGRAMS } from '@/lib/constants';

export default function ExportPage() {
  const [total, setTotal] = useState(0);
  const [program, setProgram] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '1' });
    if (program) params.set('program', program);
    fetch(`/api/mentors?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setTotal(data.total || 0));
  }, [program]);

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams({ format: 'csv' });
    if (program) params.set('program', program);

    const res = await fetch(`/api/mentors/export?${params.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fgcu-mentors-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Export Mentors</h1>

      <div className="glass-card rounded-2xl shadow-lg p-8 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Filter by Program (Optional)
          </label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue"
          >
            <option value="">All Programs</option>
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-fgcu-blue">{total}</span> mentors will be exported
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="w-full bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
        >
          {exporting ? 'Exporting...' : `Export ${total} Mentors as CSV`}
        </button>
      </div>
    </div>
  );
}
