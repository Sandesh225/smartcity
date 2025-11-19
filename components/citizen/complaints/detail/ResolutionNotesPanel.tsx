// FILE: components/citizen/complaints/detail/ResolutionNotesPanel.tsx
"use client";

import { CheckCircle2 } from "lucide-react";

interface ResolutionNotesPanelProps {
  notes: string;
}

export function ResolutionNotesPanel({ notes }: ResolutionNotesPanelProps) {
  return (
    <section className="rounded-2xl border border-emerald-500/35 bg-emerald-950/50 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Resolution notes
        </h2>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-50/95">
        {notes}
      </p>
    </section>
  );
}
