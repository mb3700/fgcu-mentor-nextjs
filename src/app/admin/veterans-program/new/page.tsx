'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEMESTERS } from '@/lib/constants';

export default function NewWorkshopPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    date: '',
    topic: '',
    notes: '',
    semester: 'Spring 2026',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/veterans-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(form.date + 'T12:00:00').toISOString(),
          topic: form.topic,
          notes: form.notes || null,
          semester: form.semester,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create workshop');
      }

      const workshop = await res.json();
      router.push(`/admin/veterans-program/${workshop.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workshop');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/veterans-program"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Veterans Program
      </Link>

      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Create New Workshop</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 shadow-sm space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic *</label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => update('topic', e.target.value)}
            placeholder="e.g. Business Model Canvas Workshop"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester *</label>
          <select
            value={form.semester}
            onChange={(e) => update('semester', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !form.date || !form.topic}
            className="px-6 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            {saving ? 'Creating...' : 'Create Workshop'}
          </button>
          <Link
            href="/admin/veterans-program"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
