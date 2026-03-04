'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROGRAMS, DOMAIN_OPTIONS, SECTOR_OPTIONS, STATUS_OPTIONS, WORK_STATUS_OPTIONS } from '@/lib/constants';
import type { Mentor } from '@/types';

interface MentorFormProps {
  mentor?: Mentor | null;
  isNew: boolean;
}

export function MentorForm({ mentor, isNew }: MentorFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(mentor?.name || '');
  const [title, setTitle] = useState(mentor?.title || '');
  const [businessName, setBusinessName] = useState(mentor?.businessName || '');
  const [email, setEmail] = useState(mentor?.email || '');
  const [phone, setPhone] = useState(mentor?.phone || '');
  const [location, setLocation] = useState(mentor?.location || '');
  const [biography, setBiography] = useState(mentor?.biography || '');
  const [status, setStatus] = useState(mentor?.status || 'Available');
  const [workStatus, setWorkStatus] = useState(mentor?.workStatus || '');
  const [mentorCoordinator, setMentorCoordinator] = useState(mentor?.mentorCoordinator || '');
  const [programs, setPrograms] = useState<string[]>(mentor?.programs || []);
  const [domainExpertise, setDomainExpertise] = useState<string[]>(mentor?.domainExpertise || []);
  const [sectorExpertise, setSectorExpertise] = useState<string[]>(mentor?.sectorExpertise || []);
  const [fgcuAlumni, setFgcuAlumni] = useState(mentor?.fgcuAlumni || false);
  const [veteranStatus, setVeteranStatus] = useState(mentor?.veteranStatus || false);
  const [potentialSpeaker, setPotentialSpeaker] = useState(mentor?.potentialSpeaker || false);
  const [potentialJudge, setPotentialJudge] = useState(mentor?.potentialJudge || false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }

    setSaving(true);
    setError('');

    const body = {
      name: name.trim(),
      status,
      businessName: businessName.trim() || null,
      title: title.trim() || null,
      location: location.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      biography: biography.trim() || null,
      fgcuAlumni,
      domainExpertise,
      sectorExpertise,
      programs,
      workStatus: workStatus || null,
      potentialSpeaker,
      potentialJudge,
      mentorCoordinator: mentorCoordinator.trim() || null,
      veteranStatus,
    };

    const url = isNew ? '/api/mentors' : `/api/mentors/${mentor?.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/mentors/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CEO, Managing Director"
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business / Company</label>
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Fort Myers, FL"
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
      </div>

      {/* Biography */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Biography</label>
        <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={5}
          className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent resize-y" />
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Work Status</label>
          <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue">
            <option value="">Not specified</option>
            {WORK_STATUS_OPTIONS.map((ws) => <option key={ws} value={ws}>{ws}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor Coordinator</label>
          <input type="text" value={mentorCoordinator} onChange={(e) => setMentorCoordinator(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent" />
        </div>
      </div>

      {/* Programs */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Mentoring Programs</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PROGRAMS.map((p) => (
            <label key={p} className="flex items-center space-x-2 p-2.5 rounded-lg border border-gray-200 hover:border-fgcu-blue/30 cursor-pointer transition-colors">
              <input type="checkbox" checked={programs.includes(p)} onChange={() => toggle(programs, setPrograms, p)}
                className="w-4 h-4 text-fgcu-blue rounded border-gray-300 focus:ring-fgcu-blue" />
              <span className="text-sm text-gray-700">{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Domain Expertise */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Domain Expertise</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {DOMAIN_OPTIONS.map((d) => (
            <label key={d} className="flex items-center space-x-2 p-2.5 rounded-lg border border-gray-200 hover:border-fgcu-green/30 cursor-pointer transition-colors">
              <input type="checkbox" checked={domainExpertise.includes(d)} onChange={() => toggle(domainExpertise, setDomainExpertise, d)}
                className="w-4 h-4 text-fgcu-green rounded border-gray-300 focus:ring-fgcu-green" />
              <span className="text-sm text-gray-700">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sector Expertise */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sector Expertise</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {SECTOR_OPTIONS.map((s) => (
            <label key={s} className="flex items-center space-x-2 p-2.5 rounded-lg border border-gray-200 hover:border-fgcu-gold/30 cursor-pointer transition-colors">
              <input type="checkbox" checked={sectorExpertise.includes(s)} onChange={() => toggle(sectorExpertise, setSectorExpertise, s)}
                className="w-4 h-4 text-fgcu-gold rounded border-gray-300 focus:ring-fgcu-gold" />
              <span className="text-sm text-gray-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Additional Flags</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'FGCU Alumni', checked: fgcuAlumni, onChange: setFgcuAlumni },
            { label: 'Veteran', checked: veteranStatus, onChange: setVeteranStatus },
            { label: 'Speaker', checked: potentialSpeaker, onChange: setPotentialSpeaker },
            { label: 'Judge', checked: potentialJudge, onChange: setPotentialJudge },
          ].map(({ label, checked, onChange }) => (
            <label key={label} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-fgcu-blue/30 cursor-pointer transition-colors">
              <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-fgcu-blue rounded border-gray-300" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-8 py-3 bg-fgcu-blue hover:bg-fgcu-blue-light disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
          {saving ? 'Saving...' : isNew ? 'Add Mentor' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
