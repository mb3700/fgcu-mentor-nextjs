'use client';

import { MentorForm } from '@/components/mentors/MentorForm';

export default function NewMentorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Add New Mentor</h1>
      <div className="glass-card rounded-2xl shadow-lg p-8 fade-in">
        <MentorForm isNew />
      </div>
    </div>
  );
}
