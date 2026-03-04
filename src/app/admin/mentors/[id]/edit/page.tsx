'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MentorForm } from '@/components/mentors/MentorForm';
import { Spinner } from '@/components/ui/Spinner';
import type { Mentor } from '@/types';

export default function EditMentorPage() {
  const params = useParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mentors/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setMentor(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!mentor) {
    return <div className="text-center py-20"><p className="text-gray-500">Mentor not found.</p></div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-fgcu-blue mb-6">Edit {mentor.name}</h1>
      <div className="glass-card rounded-2xl shadow-lg p-8 fade-in">
        <MentorForm mentor={mentor} isNew={false} />
      </div>
    </div>
  );
}
