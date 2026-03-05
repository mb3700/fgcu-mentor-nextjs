export default function Loading() {
  return (
    <>
      {/* Hero Skeleton */}
      <div className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="h-6 w-40 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-12 w-80 bg-white/10 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-96 max-w-full bg-white/10 rounded mx-auto mb-8 animate-pulse" />
            <div className="h-14 w-full max-w-xl bg-white/10 rounded-2xl mx-auto animate-pulse" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card rounded-2xl p-5 text-center">
                <div className="h-8 w-16 bg-white/10 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-3 w-20 bg-white/10 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:-mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-[260px] bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8" />
    </>
  );
}
