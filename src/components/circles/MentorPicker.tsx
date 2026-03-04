'use client';

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface MentorOption {
  id: number;
  name: string;
  businessName: string | null;
  photoUrl: string | null;
}

interface MentorPickerProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function MentorPicker({ selectedIds, onChange }: MentorPickerProps) {
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mentors?limit=200')
      .then((r) => r.json())
      .then((data) => {
        setMentors(
          (data.mentors || []).map((m: MentorOption) => ({
            id: m.id,
            name: m.name,
            businessName: m.businessName,
            photoUrl: m.photoUrl,
          }))
        );
        setLoading(false);
      });
  }, []);

  const filtered = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.businessName && m.businessName.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">Loading mentors...</div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mentors..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          {selectedIds.length} mentor{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
        {filtered.map((m) => {
          const isSelected = selectedIds.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
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
              <Avatar name={m.name} size="sm" photoUrl={m.photoUrl} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                {m.businessName && (
                  <p className="text-xs text-gray-400 truncate">{m.businessName}</p>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400">
            No mentors found
          </div>
        )}
      </div>
    </div>
  );
}
