// FILE: components/citizen/complaints/detail/DetailSkeleton.tsx
"use client";

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-glass-soft bg-surface-deep/90 p-4 sm:p-5 shadow-glass-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-slate-900/60" />
        <div className="relative z-10 space-y-3 animate-pulse">
          <div className="h-4 w-40 rounded-full bg-slate-700/60" />
          <div className="h-6 w-64 rounded-full bg-slate-700/70" />
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="h-5 w-20 rounded-full bg-slate-800/80" />
            <div className="h-5 w-24 rounded-full bg-slate-800/80" />
          </div>
          <div className="mt-2 h-3 w-72 rounded-full bg-slate-800/80" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left skeleton */}
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>

        {/* Right skeleton */}
        <div className="space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-2xl border border-glass-soft bg-surface-elevated/90 p-4 sm:p-5 shadow-glass-md">
      <div className="mb-3 h-3 w-32 rounded-full bg-slate-700/70" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`h-3 rounded-full bg-slate-800/80 ${
              idx === lines - 1 ? "w-3/5" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
