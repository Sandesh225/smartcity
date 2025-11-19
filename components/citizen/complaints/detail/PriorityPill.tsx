// FILE: components/citizen/complaints/detail/PriorityPill.tsx
"use client";

import { getPriorityTone } from "./utils";
import type { ComplaintPriority } from "./types";

interface PriorityPillProps {
  priority: ComplaintPriority;
}

export function PriorityPill({ priority }: PriorityPillProps) {
  const tone = getPriorityTone(priority);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        "backdrop-blur-sm border",
        tone.bg,
        tone.text,
        tone.border,
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="capitalize">{priority}</span>
    </span>
  );
}
