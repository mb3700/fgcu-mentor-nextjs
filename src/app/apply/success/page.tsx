import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Received',
  description: 'Your mentor application has been received and is pending review.',
};

export default function ApplySuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass-card rounded-2xl p-8 md:p-12 shadow-lg max-w-lg w-full text-center fade-in">
        <div className="w-16 h-16 bg-fgcu-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-fgcu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-fgcu-blue mb-3">Application Received</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          Thank you for your interest in becoming a mentor with FGCU&apos;s School of Entrepreneurship.
          Your application has been received and is pending review. We&apos;ll be in touch soon.
        </p>

        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
