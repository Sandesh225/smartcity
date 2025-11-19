// FILE: components/citizen/complaints/detail/StatusPill.tsx
"use client";

import { getStatusTone, formatStatusLabel } from "./utils";
import type { ComplaintStatus } from "./types";

interface StatusPillProps {
  status: ComplaintStatus | string;
}

export function StatusPill({ status }: StatusPillProps) {
  const tone = getStatusTone(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        "border border-white/10",
        "backdrop-blur-sm",
        tone.bg,
        tone.text,
        tone.ring ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shadow ${tone.dot}`}
      />
      <span>{formatStatusLabel(status)}</span>
    </span>
  );
}
