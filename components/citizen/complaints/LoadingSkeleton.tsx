// components/citizen/complaints/LoadingSkeleton.tsx
type LoadingSkeletonProps = {
  variant: 'table' | 'grid';
  density: 'cozy' | 'compact';
};

export function LoadingSkeleton({ variant, density }: LoadingSkeletonProps) {
  if (variant === 'grid') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-slate-800/80 bg-slate-950/80"
          >
            <div className="h-full space-y-3 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-24 rounded-full bg-slate-800/80" />
                <div className="h-4 w-16 rounded-full bg-slate-800/80" />
              </div>
              <div className="h-4 w-full rounded-full bg-slate-800/80" />
              <div className="h-4 w-3/4 rounded-full bg-slate-800/80" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded-full bg-slate-800/80" />
                <div className="h-4 w-20 rounded-full bg-slate-800/80" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const rowHeight = density === 'compact' ? 'h-9' : 'h-11';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 rounded-full bg-slate-800/80" />
        <div className="h-4 w-24 rounded-full bg-slate-800/80" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80">
        <div className="grid grid-cols-[140px,1fr,120px,110px,140px,130px,72px] border-b border-slate-800/80 bg-slate-900/80 px-3 py-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-3 rounded-full bg-slate-800/80" />
          ))}
        </div>
        <div className="divide-y divide-slate-900/80">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`grid animate-pulse grid-cols-[140px,1fr,120px,110px,140px,130px,72px] bg-slate-950/80 px-3 ${rowHeight}`}
            >
              {Array.from({ length: 7 }).map((__, j) => (
                <div
                  key={j}
                  className="my-1 h-3.5 rounded-full bg-slate-800/80"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
