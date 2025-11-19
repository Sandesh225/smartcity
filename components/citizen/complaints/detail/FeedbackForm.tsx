// FILE: components/citizen/complaints/detail/FeedbackForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackFormProps {
  complaintId: string;
  onSubmitted: () => void;
}

export function FeedbackForm({ complaintId, onSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const { user } = useAuth();

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!rating) {
      setSubmitError("Please select a rating before submitting.");
      return;
    }

    if (!user) {
      setSubmitError("You must be logged in to submit feedback.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabaseBrowser.from("complaint_feedback").insert({
      complaint_id: complaintId,
      citizen_id: user.id,
      rating,
      feedback_comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setSubmitError("Something went wrong while sending your feedback.");
      return;
    }

    setSubmitSuccess("Thank you. Your feedback has been recorded.");
    onSubmitted();
  };

  return (
    <section className="rounded-2xl border border-amber-400/40 bg-amber-950/60 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <header className="mb-3 space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          Rate this resolution
        </h2>
        <p className="text-xs text-amber-100/80">
          Your feedback helps the municipality improve how issues are resolved.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-50/90">
            Overall satisfaction
          </p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating ?? rating) >= star;
              return (
                <motion.button
                  key={star}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="rounded-full p-1.5"
                >
                  <Star
                    className={[
                      "h-5 w-5 transition-colors",
                      active
                        ? "fill-amber-400 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.65)]"
                        : "text-slate-600",
                    ].join(" ")}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-50/90">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-700/80 bg-surface-soft/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition focus:border-emerald-400/70"
            placeholder="Share what worked well, or what could be improved…"
          />
        </div>

        {submitError && (
          <p className="text-xs text-rose-300">{submitError}</p>
        )}
        {submitSuccess && (
          <p className="text-xs text-emerald-200">{submitSuccess}</p>
        )}

        <motion.button
          type="button"
          whileTap={submitting ? {} : { scale: 0.97 }}
          disabled={submitting || rating === 0}
          onClick={handleSubmit}
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
            "bg-gradient-to-r from-emerald-500 to-emerald-400 text-emerald-950",
            "shadow-[0_18px_40px_rgba(16,185,129,0.45)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting…</span>
            </>
          ) : (
            <span>Submit feedback</span>
          )}
        </motion.button>
      </div>
    </section>
  );
}
