'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { AttendanceBadge } from '@/components/circles/AttendanceBadge';
import { SEMESTERS, ATTENDEE_STATUSES } from '@/lib/constants';
import type { RunwayEvent, RunwayEventAssignment, Mentor } from '@/types';

interface EditRunwayEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditRunwayEventPage({ params }: EditRunwayEventPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<RunwayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Event details form
  const [form, setForm] = useState({
    date: '',
    title: '',
    description: '',
    location: '',
    cancelled: false,
    semester: 'Spring 2026',
  });

  // Mentor picker state
  const [showPicker, setShowPicker] = useState(false);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [assigning, setAssigning] = useState<number | null>(null);

  const fetchEvent = async () => {
    const res = await fetch(`/api/runway-program/${id}`);
    if (!res.ok) {
      setError('Event not found');
      setLoading(false);
      return;
    }
    const data: RunwayEvent = await res.json();
    setEvent(data);
    setForm({
      date: new Date(data.date).toISOString().split('T')[0],
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      cancelled: data.cancelled,
      semester: data.semester,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
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
      const res = await fetch(`/api/runway-program/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(form.date + 'T12:00:00').toISOString(),
          title: form.title,
          description: form.description || null,
          location: form.location || null,
          cancelled: form.cancelled,
          semester: form.semester,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Event saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save event');
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (assignment: RunwayEventAssignment, newStatus: string) => {
    await fetch(`/api/runway-program/${id}/assignments/${assignment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchEvent();
  };

  const handleRemoveMentor = async (mentorId: number) => {
    await fetch(`/api/runway-program/${id}/assignments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId }),
    });
    await fetchEvent();
  };

  // Picker functions
  const openPicker = async () => {
    setShowPicker(true);
    setPickerSearch('');
    const res = await fetch('/api/mentors?program=Runway+Program&limit=200');
    const data = await res.json();
    setAvailableMentors(data.mentors || []);
  };

  const handleAssignMentor = async (mentorId: number) => {
    setAssigning(mentorId);
    await fetch(`/api/runway-program/${id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorIds: [mentorId] }),
    });
    await fetchEvent();
    setAssigning(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-fgcu-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Event not found</p>
        <Link href="/admin/runway-program" className="text-fgcu-blue text-sm font-medium mt-2 inline-block">
          Back to Runway Program
        </Link>
      </div>
    );
  }

  const assignments = event.assignments || [];
  const assignedMentorIds = new Set(assignments.map((a) => a.mentorId));
  const filteredPickerMentors = availableMentors.filter(
    (m) =>
      !assignedMentorIds.has(m.id) &&
      (pickerSearch === '' ||
        m.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        (m.businessName || '').toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/runway-program"
        className="inline-flex items-center text-sm text-gray-500 hover:text-fgcu-blue font-medium mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Runway Program
      </Link>

      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Edit Event</h1>

      {/* Section 1: Event Details Form */}
      <form onSubmit={handleSaveDetails} className="glass-card rounded-2xl p-6 shadow-sm space-y-5 mb-8">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">Event Details</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. DKSE Incubator, Room 201"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
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

      {/* Section 2: Assigned Mentors */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
            Assigned Mentors ({assignments.length})
          </h2>
          <button
            onClick={openPicker}
            className="inline-flex items-center px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Assign Mentor
          </button>
        </div>

        {/* Mentor Picker */}
        {showPicker && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Assign a Runway mentor to this event</span>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search by name or company..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent mb-3"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredPickerMentors.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No available mentors to assign</p>
              ) : (
                filteredPickerMentors.slice(0, 20).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                        {m.businessName && (
                          <p className="text-xs text-gray-400 truncate">{m.businessName}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignMentor(m.id)}
                      disabled={assigning === m.id}
                      className="px-3 py-1 bg-fgcu-blue/10 hover:bg-fgcu-blue/20 text-fgcu-blue text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {assigning === m.id ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No mentors assigned yet. Click &quot;Assign Mentor&quot; to add mentors to this event.
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map((assignment) => {
              const mentorName = assignment.mentor?.name || `Mentor #${assignment.mentorId}`;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-3 py-1.5"
                >
                  <Avatar name={mentorName} size="sm" />
                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">
                    {mentorName}
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
                    onClick={() => handleRemoveMentor(assignment.mentorId)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove mentor"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
