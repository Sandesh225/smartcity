// FILE: components/citizen/complaints/new/StepCategory.tsx
import { useComplaintCategories } from "@/hooks/useComplaintCategories";
import {
  useCitizenComplaintWizard,
  type ComplaintCategory,
  type PriorityLevel,
} from "@/stores/useCitizenComplaintWizard";

const priorityTone: Record<PriorityLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-200 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-200 ring-amber-500/30",
  high: "bg-red-500/10 text-red-200 ring-red-500/30",
  critical: "bg-red-600/15 text-red-200 ring-red-500/40",
};

export function StepCategory() {
  const { categories, loading, errorText } = useComplaintCategories();
  const { selectedCategory, setCategory, setStep } = useCitizenComplaintWizard();

  const handleSelect = (cat: ComplaintCategory) => {
    setCategory(cat);
    setStep(2);
  };

  if (loading) {
    return <CategorySkeleton />;
  }

  if (errorText) {
    return (
      <div className="space-y-4">
        <HeaderCopy />
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium text-amber-200">
            We couldn&apos;t load complaint categories.
          </p>
          <p className="mt-1 text-[12px] text-amber-200/80">
            {errorText} Please try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HeaderCopy />

      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className={[
                "group relative flex h-full flex-col rounded-2xl border px-4 py-3 text-left transition-all",
                "bg-surface-soft/70 backdrop-blur",
                isSelected
                  ? "border-emerald-400/80 shadow-[0_18px_45px_rgba(16,185,129,0.4)]"
                  : "border-glass-soft hover:border-emerald-400/60 hover:bg-surface-soft/90",
              ].join(" ")}
            >
              {/* active halo */}
              {isSelected && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl" />
              )}

              <div className="relative z-10 flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-50">
                      {cat.category_name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1 line-clamp-3 text-xs text-slate-400">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={[
                      "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium",
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                        : "border-slate-600 bg-surface-deep/90 text-slate-500",
                    ].join(" ")}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1",
                      priorityTone[cat.default_priority],
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="capitalize">{cat.default_priority}</span>
                  </span>
                  {cat.sla_hours && (
                    <span className="rounded-full bg-surface-deep/80 px-2 py-0.5 text-[11px] text-slate-400">
                      Target response:{" "}
                      <span className="text-slate-200">
                        {cat.sla_hours}h
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeaderCopy() {
  return (
    <div className="space-y-1.5">
      <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
        Choose a complaint category
      </h2>
      <p className="max-w-xl text-sm text-slate-400">
        Pick the option that best matches the issue you&apos;re reporting so it
        reaches the right team faster.
      </p>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-5">
      <HeaderCopy />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-2xl border border-glass-soft bg-surface-soft/80"
          >
            <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-950/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
