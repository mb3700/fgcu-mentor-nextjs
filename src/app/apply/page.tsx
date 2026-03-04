import type { Metadata } from 'next';
import { ApplicationForm } from '@/components/mentors/ApplicationForm';

export const metadata: Metadata = {
  title: 'Apply to Become a Mentor',
  description: 'Join the FGCU School of Entrepreneurship mentor network. Share your expertise and help shape the next generation of entrepreneurs.',
};

export default function ApplyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-fgcu-blue">Become a Mentor</h1>
        <p className="text-gray-600 mt-3 leading-relaxed">
          Thank you for your interest in mentoring with the FGCU Daveler &amp; Kauanui School of Entrepreneurship.
          Please complete the form below and our team will review your application.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-lg">
        <ApplicationForm />
      </div>
    </div>
  );
}
