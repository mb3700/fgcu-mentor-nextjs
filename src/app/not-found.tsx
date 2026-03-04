import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 bg-fgcu-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-extrabold text-fgcu-blue/30">404</span>
        </div>
        <h1 className="text-2xl font-extrabold text-fgcu-blue mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-fgcu-blue hover:bg-fgcu-blue-light text-white font-semibold text-sm rounded-xl transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
