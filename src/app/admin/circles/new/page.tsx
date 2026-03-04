'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DAYS_OF_WEEK, SEMESTERS } from '@/lib/constants';

export default function NewCirclePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    coordinator: '',
    dayOfWeek: 'Thursday',
    startTime: '12:00 PM',
    endTime: '1:15 PM',
    semester: 'Spring 2026',
    location: '',
    notes: '',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          location: form.location || null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create circle');
      }

      const circle = await res.json();
      router.push(`/admin/circles/${circle.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/circles"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Circles
      </Link>

      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Create New Circle</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 shadow-sm space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Circle Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Thursday Circle - Bergeron"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        {/* Coordinator */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coordinator *</label>
          <input
            type="text"
            value={form.coordinator}
            onChange={(e) => update('coordinator', e.target.value)}
            placeholder="e.g. Peter Bergeron"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        {/* Day + Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Day of Week *</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => update('dayOfWeek', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time *</label>
            <input
              type="text"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              placeholder="12:00 PM"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time *</label>
            <input
              type="text"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              placeholder="1:15 PM"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
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

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Lutgert Hall Room 1201"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
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
            disabled={saving || !form.name || !form.coordinator}
            className="px-6 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            {saving ? 'Creating...' : 'Create Circle'}
          </button>
          <Link
            href="/admin/circles"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
