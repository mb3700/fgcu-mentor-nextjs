'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { SEMESTERS } from '@/lib/constants';
import type { Mentor, RunwayEvent } from '@/types';

export default function AdminRunwayProgramPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [events, setEvents] = useState<RunwayEvent[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [semester, setSemester] = useState('Spring 2026');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  // Add Mentor picker state
  const [showPicker, setShowPicker] = useState(false);
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [adding, setAdding] = useState<number | null>(null);

  const fetchMentors = async () => {
    setLoadingMentors(true);
    const res = await fetch('/api/mentors?program=Runway+Program&limit=200');
    const data = await res.json();
    setMentors(data.mentors || []);
    setLoadingMentors(false);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    const params = new URLSearchParams();
    if (semester) params.set('semester', semester);
    const res = await fetch(`/api/runway-program?${params.toString()}`);
    const data = await res.json();
    setEvents(data);
    setLoadingEvents(false);
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [semester]);

  const handleRemoveMentor = async (mentorId: number) => {
    if (!confirm('Remove this mentor from the Runway Program?')) return;
    setRemoving(mentorId);
    await fetch('/api/runway-program/mentors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId }),
    });
    setMentors((prev) => prev.filter((m) => m.id !== mentorId));
    setRemoving(null);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Delete this event and all its assignments? This cannot be undone.')) return;
    setDeleting(eventId);
    await fetch(`/api/runway-program/${eventId}`, { method: 'DELETE' });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setDeleting(null);
  };

  // Picker functions
  const openPicker = async () => {
    setShowPicker(true);
    setPickerSearch('');
    const res = await fetch('/api/mentors?limit=200&status=Available');
    const data = await res.json();
    setAllMentors(data.mentors || []);
  };

  const handleAddMentor = async (mentorId: number) => {
    setAdding(mentorId);
    await fetch('/api/runway-program/mentors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId }),
    });
    await fetchMentors();
    setAdding(null);
  };

  const runwayMentorIds = new Set(mentors.map((m) => m.id));
  const filteredPickerMentors = allMentors.filter(
    (m) =>
      !runwayMentorIds.has(m.id) &&
      (pickerSearch === '' ||
        m.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        (m.businessName || '').toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-fgcu-blue">Runway Program</h1>
          <p className="text-sm text-gray-500 mt-1">Manage mentors and events for the Runway Program</p>
        </div>
        <Link
          href="/admin/runway-program/events/new"
          className="inline-flex items-center px-5 py-2.5 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </Link>
      </div>

      {/* ─── MENTORS SECTION ─── */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
            Program Mentors ({mentors.length})
          </h2>
          <button
            onClick={openPicker}
            className="inline-flex items-center px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Mentor
          </button>
        </div>

        {/* Add Mentor Picker */}
        {showPicker && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Add mentor to program</span>
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
                <p className="text-xs text-gray-400 text-center py-4">No available mentors found</p>
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
                      onClick={() => handleAddMentor(m.id)}
                      disabled={adding === m.id}
                      className="px-3 py-1 bg-fgcu-blue/10 hover:bg-fgcu-blue/20 text-fgcu-blue text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {adding === m.id ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {loadingMentors ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 skeleton rounded-full" />
                <div className="h-4 w-32 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No mentors in the Runway Program yet. Click &quot;Add Mentor&quot; to get started.
          </p>
        ) : (
          <div className="space-y-1">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Avatar name={mentor.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/mentors/${mentor.id}`}
                    className="text-sm font-medium text-gray-700 hover:text-fgcu-blue transition-colors truncate block"
                  >
                    {mentor.name}
                  </Link>
                  <p className="text-xs text-gray-400 truncate">
                    {[mentor.title, mentor.businessName].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMentor(mentor.id)}
                  disabled={removing === mentor.id}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  title="Remove from program"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── EVENTS SECTION ─── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider">
          Events
        </h2>
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

      {loadingEvents ? (
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
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700">No events found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first Runway event to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const assignmentCount = event.assignments?.length || 0;
            const isPast = eventDate < new Date();

            return (
              <div
                key={event.id}
                className="glass-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-fgcu-blue truncate">{event.title}</h3>
                      {event.cancelled && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                          Cancelled
                        </span>
                      )}
                      {!event.cancelled && isPast && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Past
                        </span>
                      )}
                      {!event.cancelled && !isPast && (
                        <span className="px-2 py-0.5 rounded-full bg-fgcu-green/10 text-fgcu-green text-xs font-medium">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {assignmentCount} mentor{assignmentCount !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/runway-program/events/${event.id}/edit`}
                      className="px-4 py-2 bg-fgcu-blue/5 hover:bg-fgcu-blue/10 text-fgcu-blue text-sm font-semibold rounded-xl transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deleting === event.id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deleting === event.id ? 'Deleting...' : 'Delete'}
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
