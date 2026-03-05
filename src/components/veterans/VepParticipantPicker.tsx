'use client';

import { useState, useEffect } from 'react';
import { VepRoleBadge } from '@/components/veterans/VepRoleBadge';
import type { VepParticipant } from '@/types';

interface VepParticipantPickerProps {
  workshopId: number;
  existingParticipantIds: number[];
  onAssign: () => void;
}

export function VepParticipantPicker({
  workshopId,
  existingParticipantIds,
  onAssign,
}: VepParticipantPickerProps) {
  const [participants, setParticipants] = useState<VepParticipant[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetch('/api/veterans-program/participants')
      .then((r) => r.json())
      .then((data: VepParticipant[]) => {
        setParticipants(data);
        setLoading(false);
      });
  }, []);

  const available = participants.filter(
    (p) => !existingParticipantIds.includes(p.id) && p.isActive
  );

  const filtered = available.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setAssigning(true);

    await fetch(`/api/veterans-program/${workshopId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds: selectedIds }),
    });

    setSelectedIds([]);
    setAssigning(false);
    onAssign();
  };

  const roleTabs = [
    { key: 'all', label: 'All' },
    { key: 'mentor', label: 'Mentors' },
    { key: 'speaker', label: 'Speakers' },
    { key: 'judge', label: 'Judges' },
  ];

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">Loading participants...</div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Role Filter Tabs */}
      <div className="flex border-b border-gray-100">
        {roleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRoleFilter(tab.key)}
            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === tab.key
                ? 'bg-fgcu-blue/5 text-fgcu-blue border-b-2 border-fgcu-blue'
                : 'text-gray-500 hover:text-fgcu-blue hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search participants..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          {selectedIds.length} participant{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
        {filtered.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          const fullName = `${p.firstName} ${p.lastName}`;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                isSelected ? 'bg-fgcu-blue/5' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-fgcu-blue border-fgcu-blue'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{fullName}</p>
              </div>
              <VepRoleBadge role={p.role} />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400">
            No participants available
          </div>
        )}
      </div>

      {/* Assign Button */}
      {selectedIds.length > 0 && (
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning}
            className="w-full px-4 py-2 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
          >
            {assigning
              ? 'Assigning...'
              : `Assign ${selectedIds.length} Participant${selectedIds.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
