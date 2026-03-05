'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VepRoleBadge } from '@/components/veterans/VepRoleBadge';
import { SEMESTERS } from '@/lib/constants';
import type { VepWorkshop } from '@/types';

export default function AdminVeteransProgramPage() {
  const [workshops, setWorkshops] = useState<VepWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('Spring 2026');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchWorkshops = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (semester) params.set('semester', semester);
    const res = await fetch(`/api/veterans-program?${params.toString()}`);
    const data = await res.json();
    setWorkshops(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkshops();
  }, [semester]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this workshop and all its assignments? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/veterans-program/${id}`, { method: 'DELETE' });
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
    setDeleting(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-fgcu-blue">Veterans Program</h1>
          <p className="text-sm text-gray-500 mt-1">Manage workshops, participants, and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/veterans-program/participants"
            className="inline-flex items-center px-5 py-2.5 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue font-semibold text-sm rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Roster
          </Link>
          <Link
            href="/admin/veterans-program/new"
            className="inline-flex items-center px-5 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Workshop
          </Link>
        </div>
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
      ) : workshops.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700">No workshops found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first workshop to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((workshop) => {
            const workshopDate = new Date(workshop.date);
            const assignmentCount = workshop.assignments?.length || 0;
            const isPast = workshopDate < new Date();

            return (
              <div
                key={workshop.id}
                className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-fgcu-blue truncate">{workshop.topic}</h3>
                      {workshop.cancelled && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                          Cancelled
                        </span>
                      )}
                      {!workshop.cancelled && isPast && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Past
                        </span>
                      )}
                      {!workshop.cancelled && !isPast && (
                        <span className="px-2 py-0.5 rounded-full bg-fgcu-green/10 text-fgcu-green text-xs font-medium">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {workshopDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {assignmentCount} participant{assignmentCount !== 1 ? 's' : ''} assigned
                    </p>
                    {/* Role breakdown */}
                    {workshop.assignments && workshop.assignments.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {(['mentor', 'speaker', 'judge'] as const).map((role) => {
                          const count = workshop.assignments!.filter(
                            (a) => a.participant?.role === role
                          ).length;
                          if (count === 0) return null;
                          return (
                            <span key={role} className="flex items-center gap-1">
                              <VepRoleBadge role={role} />
                              <span className="text-xs text-gray-400">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/veterans-program/${workshop.id}/edit`}
                      className="px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue text-sm font-semibold rounded-xl transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(workshop.id)}
                      disabled={deleting === workshop.id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deleting === workshop.id ? 'Deleting...' : 'Delete'}
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
