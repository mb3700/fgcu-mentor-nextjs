'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MentorCircle } from '@/types';
import { SEMESTERS } from '@/lib/constants';

export default function AdminCirclesPage() {
  const [circles, setCircles] = useState<MentorCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchCircles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (semester) params.set('semester', semester);
    const res = await fetch(`/api/circles?${params.toString()}`);
    const data = await res.json();
    setCircles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCircles();
  }, [semester]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this circle and all its sessions? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/circles/${id}`, { method: 'DELETE' });
    setCircles((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-fgcu-blue">Mentor Circles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage circles, sessions, and mentor assignments</p>
        </div>
        <Link
          href="/admin/circles/new"
          className="inline-flex items-center px-5 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Circle
        </Link>
      </div>

      {/* Semester Filter */}
      <div className="mb-6">
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-5 w-40 skeleton rounded" />
                <div className="h-4 w-24 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : circles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700">No circles found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first mentor circle to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {circles.map((circle) => {
            const sessionCount = circle.sessions?.length || 0;
            const uniqueMentors = new Set(
              circle.sessions?.flatMap((s) => s.attendees?.map((a) => a.mentorId) || []) || []
            );
            return (
              <div
                key={circle.id}
                className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-fgcu-blue truncate">{circle.name}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{circle.semester}</span>
                      {!circle.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {circle.dayOfWeek}s {circle.startTime} – {circle.endTime} · Coordinator: {circle.coordinator}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {sessionCount} session{sessionCount !== 1 ? 's' : ''} · {uniqueMentors.size} mentor{uniqueMentors.size !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/circles/${circle.id}/edit`}
                      className="px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue text-sm font-semibold rounded-xl transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(circle.id)}
                      disabled={deleting === circle.id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deleting === circle.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
