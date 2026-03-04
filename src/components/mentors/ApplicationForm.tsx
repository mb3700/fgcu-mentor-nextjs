'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROGRAMS, DOMAIN_OPTIONS, SECTOR_OPTIONS, WORK_STATUS_OPTIONS } from '@/lib/constants';

export function ApplicationForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [biography, setBiography] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [programs, setPrograms] = useState<string[]>([]);
  const [domainExpertise, setDomainExpertise] = useState<string[]>([]);
  const [sectorExpertise, setSectorExpertise] = useState<string[]>([]);
  const [fgcuAlumni, setFgcuAlumni] = useState(false);
  const [veteranStatus, setVeteranStatus] = useState(false);
  const [potentialSpeaker, setPotentialSpeaker] = useState(false);
  const [potentialJudge, setPotentialJudge] = useState(false);

  // Honeypot field
  const [website, setWebsite] = useState('');

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }

    setSaving(true);
    setError('');

    const body = {
      name: name.trim(),
      businessName: businessName.trim() || null,
      title: title.trim() || null,
      location: location.trim() || null,
      phone: phone.trim() || null,
      email: email.trim(),
      biography: biography.trim() || null,
      fgcuAlumni,
      domainExpertise,
      sectorExpertise,
      programs,
      workStatus: workStatus || null,
      potentialSpeaker,
      potentialJudge,
      veteranStatus,
      website, // honeypot
    };

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push('/apply/success');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit application');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
      )}

      {/* Honeypot — hidden from real users */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="website">Leave this blank</label>
        <input
          type="text"
          id="website"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Your full name"
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
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="your@email.com"
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
        <p className="text-xs text-gray-400 mt-0.5 mb-1">Tell us about your professional background and mentoring experience</p>
        <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={5}
          className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue focus:border-transparent resize-y" />
      </div>

      {/* Work Status */}
      <div className="max-w-xs">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Work Status</label>
        <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}
          className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-fgcu-blue">
          <option value="">Not specified</option>
          {WORK_STATUS_OPTIONS.map((ws) => <option key={ws} value={ws}>{ws}</option>)}
        </select>
      </div>

      {/* Programs */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Which programs are you interested in mentoring?</label>
        <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Domain Expertise</label>
        <p className="text-xs text-gray-400 mb-2">Select your areas of expertise</p>
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Sector Expertise</label>
        <p className="text-xs text-gray-400 mb-2">Select the sectors you have experience in</p>
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Additional Information</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'FGCU Alumni', checked: fgcuAlumni, onChange: setFgcuAlumni },
            { label: 'Veteran', checked: veteranStatus, onChange: setVeteranStatus },
            { label: 'Available as Speaker', checked: potentialSpeaker, onChange: setPotentialSpeaker },
            { label: 'Available as Judge', checked: potentialJudge, onChange: setPotentialJudge },
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
      <div className="pt-4 border-t border-gray-100">
        <button type="submit" disabled={saving}
          className="w-full md:w-auto px-8 py-3 bg-fgcu-green hover:bg-fgcu-green-light disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
          {saving ? 'Submitting...' : 'Submit Application'}
        </button>
        <p className="text-xs text-gray-400 mt-3">Your application will be reviewed by our team. We will be in touch soon.</p>
      </div>
    </form>
  );
}
