// FILE: components/citizen/complaints/new/StepSuccess.tsx
import Link from "next/link";

type StepSuccessProps = {
  onContinue: () => void;
};

export function StepSuccess({ onContinue }: StepSuccessProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-surface-deep/95 px-6 py-7 shadow-glass-xl backdrop-blur-2xl sm:px-8 sm:py-9">
      {/* Glow accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-80px] h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-40px] bottom-[-80px] h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 shadow-[0_0_0_1px_rgba(34,197,94,0.6),0_20px_60px_rgba(34,197,94,0.4)]">
          <svg
            className="h-11 w-11"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17L4 12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Complaint submitted successfully
        </h2>
        <p className="mt-3 max-w-xl text-sm text-slate-200/90">
          Your complaint has been registered and assigned a tracking ID.
          We&apos;ll keep you updated as it moves through the resolution
          process.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-glass-md transition hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98]"
          >
            <span>View my complaints</span>
          </button>
          <Link
            href="/citizen/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-glass-soft bg-surface-soft/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/70 hover:text-emerald-200"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
