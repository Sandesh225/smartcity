// FILE: components/citizen/complaints/new/WizardHeader.tsx
import Link from "next/link";
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";

const TOTAL_STEPS = 3;

export function WizardHeader() {
  const { step } = useCitizenComplaintWizard();

  return (
    <header className="relative overflow-hidden rounded-2xl border border-glass-soft bg-surface-deep/95 px-4 py-4 shadow-glass-xl backdrop-blur-2xl sm:px-5 sm:py-5">
      {/* Soft gradient accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-[-40px] h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Smart City Pokhara
          </p>
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            Submit a new complaint
          </h1>
          <p className="max-w-xl text-sm text-slate-400">
            Tell us what&apos;s happening in your area so the municipality can
            respond quickly and keep Pokhara running smoothly.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-surface-soft/80 px-3 py-1 text-[11px] text-slate-400 ring-1 ring-white/5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]" />
            <span>
              Step {step} of {TOTAL_STEPS} · Approx 3–5 minutes
            </span>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <Link
            href="/citizen/complaints"
            className="inline-flex items-center gap-1.5 rounded-full border border-glass-soft bg-surface-soft/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-200"
          >
            <span className="text-sm">✕</span>
            <span>Cancel &amp; go back</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
