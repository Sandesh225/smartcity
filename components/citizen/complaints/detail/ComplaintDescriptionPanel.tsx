// FILE: components/citizen/complaints/detail/ComplaintDescriptionPanel.tsx
"use client";

interface ComplaintDescriptionPanelProps {
  description: string;
}

export function ComplaintDescriptionPanel({
  description,
}: ComplaintDescriptionPanelProps) {
  return (
    <section className="rounded-2xl border border-glass-soft bg-surface-elevated/85 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Complaint details
        </h2>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200/90">
        {description}
      </p>
    </section>
  );
}
