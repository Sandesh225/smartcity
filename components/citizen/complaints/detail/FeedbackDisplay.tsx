// FILE: components/citizen/complaints/detail/FeedbackDisplay.tsx
"use client";

import { Star } from "lucide-react";
import type { ComplaintFeedback } from "./types";

interface FeedbackDisplayProps {
  feedback: ComplaintFeedback;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <section className="rounded-2xl border border-emerald-500/45 bg-emerald-950/60 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
          Your feedback
        </h2>
      </header>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (feedback.rating ?? 0) >= star;
            return (
              <Star
                key={star}
                className={[
                  "h-4 w-4",
                  active
                    ? "fill-amber-400 text-amber-300"
                    : "text-slate-600",
                ].join(" ")}
              />
            );
          })}
        </div>
        {feedback.feedback_comment && (
          <p className="text-sm leading-relaxed text-emerald-50/90">
            {feedback.feedback_comment}
          </p>
        )}
      </div>
    </section>
  );
}
