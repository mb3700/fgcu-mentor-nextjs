'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Mentor } from '@/types';

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchMentors = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/mentors?${params.toString()}`);
    const data = await res.json();
    setMentors(data.mentors || []);
    setLoading(false);
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    setDeleting(id);
    await fetch(`/api/mentors/${id}`, { method: 'DELETE' });
    setMentors((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-fgcu-blue">Manage Mentors</h1>
        <Link
          href="/admin/mentors/new"
          className="inline-flex items-center px-5 py-2.5 bg-fgcu-green hover:bg-fgcu-green-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          + Add Mentor
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentors..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
          <button type="submit" className="px-6 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light text-white text-sm font-semibold rounded-xl transition-all cursor-pointer">
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Programs</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={mentor.name} size="sm" />
                        <div>
                          <Link href={`/mentors/${mentor.id}`} className="text-sm font-bold text-fgcu-blue hover:text-fgcu-gold transition-colors">
                            {mentor.name}
                          </Link>
                          {mentor.title && <p className="text-xs text-gray-500">{mentor.title}</p>}
                          {mentor.businessName && <p className="text-xs text-fgcu-green">{mentor.businessName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {mentor.programs.map((p) => (
                          <Badge key={p} variant="blue">{p}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant={mentor.status === 'Available' ? 'green' : 'gray'}>
                        {mentor.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/mentors/${mentor.id}/edit`}
                          className="px-3 py-1.5 bg-fgcu-blue/10 hover:bg-fgcu-blue/20 text-fgcu-blue text-xs font-semibold rounded-lg transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(mentor.id, mentor.name)}
                          disabled={deleting === mentor.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {deleting === mentor.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No mentors found. Import data or add mentors manually.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
