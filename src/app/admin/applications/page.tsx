'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import type { Mentor } from '@/types';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await fetch('/api/mentors?status=Pending+Approval&limit=200');
    const data = await res.json();
    setApplications(data.mentors || []);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleApprove = async (id: number) => {
    setActionId(id);
    const res = await fetch(`/api/mentors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Available' }),
    });
    if (res.ok) {
      setApplications((prev) => prev.filter((m) => m.id !== id));
    }
    setActionId(null);
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to reject and remove "${name}"'s application?`)) return;
    setActionId(id);
    await fetch(`/api/mentors/${id}`, { method: 'DELETE' });
    setApplications((prev) => prev.filter((m) => m.id !== id));
    setActionId(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-fgcu-blue">Pending Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : applications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 shadow-lg text-center">
          <div className="w-16 h-16 bg-fgcu-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-fgcu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No pending applications</p>
          <p className="text-gray-400 text-sm mt-1">All caught up! New applications will appear here.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.name} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-fgcu-blue">{app.name}</p>
                          {app.title && <p className="text-xs text-gray-500">{app.title}</p>}
                          {app.businessName && <p className="text-xs text-fgcu-green">{app.businessName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{app.email || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(app.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/mentors/${app.id}/edit`}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-all"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionId === app.id}
                          className="px-3 py-1.5 bg-fgcu-green/10 hover:bg-fgcu-green/20 text-fgcu-green text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {actionId === app.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(app.id, app.name)}
                          disabled={actionId === app.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
