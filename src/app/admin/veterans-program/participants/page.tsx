'use client';

import { useEffect, useState } from 'react';
import { VepRoleBadge } from '@/components/veterans/VepRoleBadge';
import { VEP_ROLES } from '@/lib/constants';
import type { VepParticipant, Mentor } from '@/types';
import Link from 'next/link';

interface MentorOption {
  id: number;
  name: string;
}

export default function AdminVepParticipantsPage() {
  const [participants, setParticipants] = useState<VepParticipant[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleTab, setRoleTab] = useState<string>('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  // Add participant form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'mentor',
    roleDetail: '',
    mentorId: '',
  });
  const [addingSaving, setAddingSaving] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit participant
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'mentor',
    roleDetail: '',
    mentorId: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchParticipants = async () => {
    const res = await fetch('/api/veterans-program/participants');
    const data = await res.json();
    setParticipants(data);
    setLoading(false);
  };

  const fetchMentors = async () => {
    const res = await fetch('/api/mentors?limit=200');
    const data = await res.json();
    setMentors(
      (data.mentors || []).map((m: Mentor) => ({
        id: m.id,
        name: m.name,
      }))
    );
  };

  useEffect(() => {
    fetchParticipants();
    fetchMentors();
  }, []);

  const filtered = participants.filter(
    (p) => roleTab === 'all' || p.role === roleTab
  );

  const roleTabs = [
    { key: 'all', label: 'All' },
    { key: 'mentor', label: 'Mentors' },
    { key: 'speaker', label: 'Speakers' },
    { key: 'judge', label: 'Judges' },
  ];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSaving(true);
    setAddError('');

    try {
      const res = await fetch('/api/veterans-program/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          email: addForm.email || null,
          role: addForm.role,
          roleDetail: addForm.roleDetail || null,
          mentorId: addForm.mentorId ? parseInt(addForm.mentorId, 10) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add participant');
      }

      setAddForm({ firstName: '', lastName: '', email: '', role: 'mentor', roleDetail: '', mentorId: '' });
      setShowAddForm(false);
      await fetchParticipants();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add participant');
    }
    setAddingSaving(false);
  };

  const startEdit = (p: VepParticipant) => {
    setEditingId(p.id);
    setEditForm({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email || '',
      role: p.role,
      roleDetail: p.roleDetail || '',
      mentorId: p.mentorId ? String(p.mentorId) : '',
    });
    setEditError('');
  };

  const handleEditSubmit = async (participantId: number) => {
    setEditSaving(true);
    setEditError('');

    try {
      const res = await fetch(`/api/veterans-program/participants/${participantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email || null,
          role: editForm.role,
          roleDetail: editForm.roleDetail || null,
          mentorId: editForm.mentorId ? parseInt(editForm.mentorId, 10) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      setEditingId(null);
      await fetchParticipants();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update');
    }
    setEditSaving(false);
  };

  const handleDelete = async (participantId: number) => {
    if (!confirm('Delete this participant? This will also remove all their workshop assignments.')) return;
    setDeleting(participantId);
    await fetch(`/api/veterans-program/participants/${participantId}`, { method: 'DELETE' });
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    setDeleting(null);
  };

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/veterans-program"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Veterans Program
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-fgcu-blue">VEP Participant Roster</h1>
          <p className="text-sm text-gray-500 mt-1">Manage mentors, speakers, and judges for the Veterans Program</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-5 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Participant
        </button>
      </div>

      {/* Add Participant Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-card rounded-2xl p-6 shadow-sm space-y-4 mb-8">
          <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">New Participant</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
              <input
                type="text"
                value={addForm.firstName}
                onChange={(e) => setAddForm((prev) => ({ ...prev, firstName: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
              <input
                type="text"
                value={addForm.lastName}
                onChange={(e) => setAddForm((prev) => ({ ...prev, lastName: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role *</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              >
                {VEP_ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role Detail</label>
              <input
                type="text"
                value={addForm.roleDetail}
                onChange={(e) => setAddForm((prev) => ({ ...prev, roleDetail: e.target.value }))}
                placeholder="e.g. Finance Expert, Keynote"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link to Mentor</label>
              <select
                value={addForm.mentorId}
                onChange={(e) => setAddForm((prev) => ({ ...prev, mentorId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
              >
                <option value="">-- None --</option>
                {mentors.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{addError}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={addingSaving || !addForm.firstName || !addForm.lastName}
              className="px-6 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              {addingSaving ? 'Adding...' : 'Add Participant'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Role Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {roleTabs.map((tab) => {
          const count = tab.key === 'all'
            ? participants.length
            : participants.filter((p) => p.role === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setRoleTab(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                roleTab === tab.key
                  ? 'bg-white text-fgcu-blue shadow-sm'
                  : 'text-gray-500 hover:text-fgcu-blue'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Participants List */}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700">No participants found</h3>
          <p className="text-sm text-gray-500 mt-1">Add a participant to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((participant) => {
            const fullName = `${participant.firstName} ${participant.lastName}`;
            const isEditing = editingId === participant.id;

            if (isEditing) {
              return (
                <div key={participant.id} className="glass-card rounded-xl p-5 shadow-sm">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First Name"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last Name"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      />
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      >
                        {VEP_ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.roleDetail}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, roleDetail: e.target.value }))}
                        placeholder="Role Detail"
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      />
                      <select
                        value={editForm.mentorId}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, mentorId: e.target.value }))}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
                      >
                        <option value="">-- No linked mentor --</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={String(m.id)}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {editError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{editError}</div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSubmit(participant.id)}
                        disabled={editSaving}
                        className="px-4 py-2 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={participant.id}
                className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{fullName}</h3>
                      <VepRoleBadge role={participant.role} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {participant.email && (
                        <span className="text-xs text-gray-500">{participant.email}</span>
                      )}
                      {participant.roleDetail && (
                        <span className="text-xs text-gray-400">{participant.roleDetail}</span>
                      )}
                      {participant.mentor && (
                        <span className="text-xs text-fgcu-blue">
                          Linked: {participant.mentor.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(participant)}
                      className="px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(participant.id)}
                      disabled={deleting === participant.id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deleting === participant.id ? 'Deleting...' : 'Delete'}
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
