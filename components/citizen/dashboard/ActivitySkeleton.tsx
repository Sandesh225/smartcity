// FILE: components/citizen/dashboard/ActivitySkeleton.tsx
'use client';

type ActivitySkeletonProps = {
  variant: "hero" | "stats" | "list" | "empty";
};

export default function ActivitySkeleton({ variant }: ActivitySkeletonProps) {
  if (variant === "hero") {
    return (
      <div className="animate-pulse rounded-3xl border border-glass-soft bg-surface-elevated/80 px-4 py-5">
        <div className="mb-4 h-4 w-40 rounded-full bg-surface-soft" />
        <div className="mb-3 h-8 w-64 rounded-full bg-surface-soft" />
        <div className="mb-4 h-4 w-80 rounded-full bg-surface-soft" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="h-16 rounded-2xl bg-surface-soft" />
          <div className="h-16 rounded-2xl bg-surface-soft" />
          <div className="h-16 rounded-2xl bg-surface-soft" />
        </div>
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded-full bg-surface-soft" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-24 rounded-2xl bg-surface-soft" />
          <div className="h-24 rounded-2xl bg-surface-soft" />
          <div className="h-24 rounded-2xl bg-surface-soft" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded-full bg-surface-soft" />
        <div className="h-32 rounded-2xl bg-surface-soft" />
      </div>
    );
  }

  // empty
  return (
    <div className="animate-pulse h-40 rounded-3xl border border-dashed border-glass-soft bg-surface-elevated/70" />
  );
}
