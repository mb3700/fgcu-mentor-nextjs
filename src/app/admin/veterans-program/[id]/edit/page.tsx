'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VepRoleBadge } from '@/components/veterans/VepRoleBadge';
import { AttendanceBadge } from '@/components/circles/AttendanceBadge';
import { VepParticipantPicker } from '@/components/veterans/VepParticipantPicker';
import { SEMESTERS, ATTENDEE_STATUSES } from '@/lib/constants';
import type { VepWorkshop, VepWorkshopAssignment } from '@/types';

interface EditWorkshopPageProps {
  params: Promise<{ id: string }>;
}

export default function EditWorkshopPage({ params }: EditWorkshopPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [workshop, setWorkshop] = useState<VepWorkshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Workshop details form
  const [form, setForm] = useState({
    date: '',
    topic: '',
    notes: '',
    cancelled: false,
    semester: 'Spring 2026',
  });

  const fetchWorkshop = async () => {
    const res = await fetch(`/api/veterans-program/${id}`);
    if (!res.ok) {
      setError('Workshop not found');
      setLoading(false);
      return;
    }
    const data: VepWorkshop = await res.json();
    setWorkshop(data);
    setForm({
      date: new Date(data.date).toISOString().split('T')[0],
      topic: data.topic,
      notes: data.notes || '',
      cancelled: data.cancelled,
      semester: data.semester,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkshop();
  }, [id]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/veterans-program/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(form.date + 'T12:00:00').toISOString(),
          topic: form.topic,
          notes: form.notes || null,
          cancelled: form.cancelled,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Workshop saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save workshop');
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (assignment: VepWorkshopAssignment, newStatus: string) => {
    await fetch(`/api/veterans-program/${id}/assignments/${assignment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchWorkshop();
  };

  const handleRemoveParticipant = async (participantId: number) => {
    await fetch(`/api/veterans-program/${id}/assignments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    });
    await fetchWorkshop();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-fgcu-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Workshop not found</p>
        <Link href="/admin/veterans-program" className="text-fgcu-blue text-sm font-medium mt-2 inline-block">
          Back to Veterans Program
        </Link>
      </div>
    );
  }

  const assignments = workshop.assignments || [];
  const existingParticipantIds = assignments.map((a) => a.participantId);

  // Group assignments by role
  const mentorAssignments = assignments.filter((a) => a.participant?.role === 'mentor');
  const speakerAssignments = assignments.filter((a) => a.participant?.role === 'speaker');
  const judgeAssignments = assignments.filter((a) => a.participant?.role === 'judge');

  const roleGroups = [
    { label: 'Mentors', role: 'mentor', items: mentorAssignments },
    { label: 'Speakers', role: 'speaker', items: speakerAssignments },
    { label: 'Judges', role: 'judge', items: judgeAssignments },
  ];

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/veterans-program"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Veterans Program
      </Link>

      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Edit Workshop</h1>

      {/* Section 1: Workshop Details Form */}
      <form onSubmit={handleSaveDetails} className="glass-card rounded-2xl p-6 shadow-sm space-y-5 mb-8">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">Workshop Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic *</label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => update('topic', e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.cancelled}
              onChange={(e) => update('cancelled', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Cancelled</span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-fgcu-green/10 border border-fgcu-green/20 rounded-xl text-sm text-fgcu-green">{success}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Section 2: Assigned Participants */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-5">
          Assigned Participants ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No participants assigned yet. Use the picker below to assign participants.
          </p>
        ) : (
          <div className="space-y-6">
            {roleGroups.map((group) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.role}>
                  <div className="flex items-center gap-2 mb-3">
                    <VepRoleBadge role={group.role} />
                    <span className="text-xs text-gray-400">({group.items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((assignment) => {
                      const fullName = assignment.participant
                        ? `${assignment.participant.firstName} ${assignment.participant.lastName}`
                        : `Participant #${assignment.participantId}`;

                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-3 py-1.5"
                        >
                          <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">
                            {fullName}
                          </span>
                          <select
                            value={assignment.status}
                            onChange={(e) => handleUpdateStatus(assignment, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-fgcu-blue"
                          >
                            {ATTENDEE_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <AttendanceBadge status={assignment.status} />
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(assignment.participantId)}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove participant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Assign Participants */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-5">
          Assign Participants
        </h2>

        <VepParticipantPicker
          workshopId={workshop.id}
          existingParticipantIds={existingParticipantIds}
          onAssign={() => fetchWorkshop()}
        />
      </div>
    </div>
  );
}
