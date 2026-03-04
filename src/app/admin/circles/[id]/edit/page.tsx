'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { AttendanceBadge } from '@/components/circles/AttendanceBadge';
import { MentorPicker } from '@/components/circles/MentorPicker';
import { DAYS_OF_WEEK, SEMESTERS, ATTENDEE_STATUSES } from '@/lib/constants';
import type { MentorCircle, CircleSession, SessionAttendee } from '@/types';

interface EditCirclePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCirclePage({ params }: EditCirclePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [circle, setCircle] = useState<MentorCircle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Circle metadata form
  const [form, setForm] = useState({
    name: '',
    coordinator: '',
    dayOfWeek: 'Thursday',
    startTime: '12:00 PM',
    endTime: '1:15 PM',
    semester: 'Spring 2026',
    location: '',
    notes: '',
    isActive: true,
  });

  // New session form
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');
  const [addingSession, setAddingSession] = useState(false);

  // Mentor assignment
  const [assigningSession, setAssigningSession] = useState<number | null>(null);
  const [pickerMentorIds, setPickerMentorIds] = useState<number[]>([]);

  const fetchCircle = async () => {
    const res = await fetch(`/api/circles/${id}`);
    if (!res.ok) {
      setError('Circle not found');
      setLoading(false);
      return;
    }
    const data: MentorCircle = await res.json();
    setCircle(data);
    setForm({
      name: data.name,
      coordinator: data.coordinator,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      semester: data.semester,
      location: data.location || '',
      notes: data.notes || '',
      isActive: data.isActive,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchCircle();
  }, [id]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/circles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          location: form.location || null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Circle saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save circle');
    }
    setSaving(false);
  };

  const handleAddSession = async () => {
    if (!newSessionDate) return;
    setAddingSession(true);
    setError('');

    try {
      const res = await fetch(`/api/circles/${id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(newSessionDate + 'T12:00:00').toISOString(),
          notes: newSessionNotes || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to add session');
      setNewSessionDate('');
      setNewSessionNotes('');
      await fetchCircle();
    } catch {
      setError('Failed to add session');
    }
    setAddingSession(false);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Delete this session and all attendee records?')) return;
    await fetch(`/api/circles/${id}/sessions/${sessionId}`, { method: 'DELETE' });
    await fetchCircle();
  };

  const handleToggleCancelled = async (session: CircleSession) => {
    await fetch(`/api/circles/${id}/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelled: !session.cancelled }),
    });
    await fetchCircle();
  };

  const handleAssignMentors = async (sessionId: number) => {
    if (pickerMentorIds.length === 0) return;

    await fetch(`/api/circles/${id}/sessions/${sessionId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorIds: pickerMentorIds }),
    });

    setAssigningSession(null);
    setPickerMentorIds([]);
    await fetchCircle();
  };

  const handleRemoveAttendee = async (sessionId: number, mentorId: number) => {
    await fetch(`/api/circles/${id}/sessions/${sessionId}/attendees`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId }),
    });
    await fetchCircle();
  };

  const handleUpdateAttendance = async (attendee: SessionAttendee, newStatus: string) => {
    const sessionId = attendee.sessionId;
    await fetch(`/api/circles/${id}/sessions/${sessionId}/attendees/${attendee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchCircle();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-fgcu-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Circle not found</p>
        <Link href="/admin/circles" className="text-fgcu-blue text-sm font-medium mt-2 inline-block">
          Back to Circles
        </Link>
      </div>
    );
  }

  const sessions = (circle.sessions || []).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/circles"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Circles
      </Link>

      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Edit Circle</h1>

      {/* Metadata Form */}
      <form onSubmit={handleSaveMetadata} className="glass-card rounded-2xl p-6 shadow-sm space-y-5 mb-8">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">Circle Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coordinator *</label>
            <input
              type="text"
              value={form.coordinator}
              onChange={(e) => update('coordinator', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Day</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
            <input
              type="text"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
            <input
              type="text"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
            />
          </div>
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
              checked={form.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-fgcu-blue focus:ring-fgcu-blue"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
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

      {/* Sessions Section */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
            Sessions ({sessions.length})
          </h2>
        </div>

        {/* Add Session */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
          <input
            type="date"
            value={newSessionDate}
            onChange={(e) => setNewSessionDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
          <input
            type="text"
            value={newSessionNotes}
            onChange={(e) => setNewSessionNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddSession}
            disabled={!newSessionDate || addingSession}
            className="px-5 py-2.5 bg-fgcu-green hover:bg-fgcu-green/90 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex-shrink-0 cursor-pointer"
          >
            {addingSession ? 'Adding...' : 'Add Session'}
          </button>
        </div>

        {/* Session List */}
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No sessions yet. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const sessionDate = new Date(session.date);
              const isPast = sessionDate < new Date();
              const attendees = session.attendees || [];

              return (
                <div
                  key={session.id}
                  className={`border rounded-xl p-4 ${
                    session.cancelled
                      ? 'border-red-200 bg-red-50/50'
                      : isPast
                      ? 'border-gray-200 bg-gray-50/50'
                      : 'border-fgcu-blue/20 bg-fgcu-blue/5'
                  }`}
                >
                  {/* Session Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-fgcu-blue">
                        {sessionDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {session.cancelled && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                          Cancelled
                        </span>
                      )}
                      {session.notes && (
                        <span className="text-xs text-gray-500 italic">{session.notes}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCancelled(session)}
                        className="text-xs text-gray-500 hover:text-fgcu-blue font-medium cursor-pointer"
                      >
                        {session.cancelled ? 'Uncancel' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div className="space-y-2">
                    {attendees.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <Avatar name={att.mentor?.name || 'Unknown'} size="sm" photoUrl={att.mentor?.photoUrl} />
                        <Link
                          href={`/mentors/${att.mentorId}`}
                          className="text-sm font-medium text-gray-700 hover:text-fgcu-blue transition-colors flex-1 min-w-0 truncate"
                        >
                          {att.mentor?.name || `Mentor #${att.mentorId}`}
                        </Link>
                        <select
                          value={att.status}
                          onChange={(e) => handleUpdateAttendance(att, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-fgcu-blue"
                        >
                          {ATTENDEE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <AttendanceBadge status={att.status} />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendee(session.id, att.mentorId)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove mentor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Assign Mentors */}
                  {assigningSession === session.id ? (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <MentorPicker
                        selectedIds={pickerMentorIds}
                        onChange={setPickerMentorIds}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleAssignMentors(session.id)}
                          disabled={pickerMentorIds.length === 0}
                          className="px-4 py-2 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          Assign {pickerMentorIds.length} Mentor{pickerMentorIds.length !== 1 ? 's' : ''}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAssigningSession(null); setPickerMentorIds([]); }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningSession(session.id);
                        setPickerMentorIds(attendees.map((a) => a.mentorId));
                      }}
                      className="mt-3 inline-flex items-center text-xs text-fgcu-blue hover:text-fgcu-blue-light font-semibold transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Mentors
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
