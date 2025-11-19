// FILE: components/citizen/complaints/new/WizardProgress.tsx
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";

const STEPS = [
  { id: 1, short: "Category", label: "Step 1" },
  { id: 2, short: "Details", label: "Step 2" },
  { id: 3, short: "Review & submit", label: "Step 3" },
];

export function WizardProgress() {
  const { step } = useCitizenComplaintWizard();

  return (
    <nav
      aria-label="Complaint submission steps"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 items-center gap-3">
        {STEPS.map((s, index) => {
          const isCompleted = step > s.id;
          const isActive = step === s.id;

          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all sm:h-8 sm:w-8",
                    isCompleted
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_0_1px_rgba(34,197,94,0.8),0_10px_35px_rgba(34,197,94,0.3)]"
                      : isActive
                      ? "bg-surface-soft text-emerald-300 ring-2 ring-emerald-500/70"
                      : "bg-surface-soft text-slate-500 ring-1 ring-white/5",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : s.id}
                </div>
                <div className="flex flex-col">
                  <span
                    className={[
                      "text-[10px] font-medium uppercase tracking-[0.18em]",
                      isActive || isCompleted
                        ? "text-slate-400"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                  <span
                    className={[
                      "text-xs sm:text-[13px] font-medium",
                      isActive
                        ? "text-slate-50"
                        : isCompleted
                        ? "text-emerald-300"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {s.short}
                  </span>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="mx-2 flex-1">
                  <div className="h-[1px] w-full overflow-hidden rounded-full bg-surface-soft/60">
                    <div
                      className={[
                        "h-full transition-all duration-300",
                        step > s.id
                          ? "w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400"
                          : "w-0 bg-surface-soft",
                      ].join(" ")}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 sm:text-right">
        You can go back at any time before submitting.
      </p>
    </nav>
  );
}
