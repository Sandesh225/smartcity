// FILE: components/citizen/complaints/new/StepReview.tsx
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";
import { useSubmitComplaint } from "@/hooks/useSubmitComplaint";

export function StepReview() {
  const wizard = useCitizenComplaintWizard();
  const { submit, isSubmitting } = useSubmitComplaint();

  const hasAttachments = wizard.attachments.length > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
          Review your complaint
        </h2>
        <p className="max-w-xl text-sm text-slate-400">
          Check everything looks correct before you submit. You can still go
          back and edit details.
        </p>
      </header>

      <div className="space-y-4">
        {/* Category */}
        <section className="rounded-2xl border border-glass-soft bg-surface-soft/70 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Category
          </p>
          {wizard.selectedCategory ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-slate-50">
                {wizard.selectedCategory.category_name}
              </span>
              {wizard.selectedCategory.default_priority && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-deep/90 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="uppercase tracking-wide">
                    {wizard.selectedCategory.default_priority}
                  </span>
                </span>
              )}
              {wizard.selectedCategory.sla_hours && (
                <span className="text-[11px] text-slate-400">
                  Target response:{" "}
                  <span className="text-slate-200">
                    {wizard.selectedCategory.sla_hours}h
                  </span>
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              No category selected.
            </p>
          )}
        </section>

        {/* Details */}
        <section className="space-y-2 rounded-2xl border border-glass-soft bg-surface-soft/70 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Complaint details
          </p>
          <ReviewField label="Title" value={wizard.title} />
          <ReviewField label="Description" value={wizard.description} multiline />
        </section>

        {/* Location */}
        <section className="space-y-2 rounded-2xl border border-glass-soft bg-surface-soft/70 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Location
          </p>
          <ReviewField
            label="Ward"
            value={wizard.wardLabel || "Not selected"}
          />
          <ReviewField
            label="Address"
            value={wizard.locationAddress || "Not provided"}
          />
          {wizard.locationLandmark && (
            <ReviewField
              label="Landmark"
              value={wizard.locationLandmark}
            />
          )}
        </section>

        {/* Attachments */}
        <section className="space-y-2 rounded-2xl border border-glass-soft bg-surface-soft/70 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Attachments
          </p>
          {hasAttachments ? (
            <p className="text-sm text-slate-200">
              {wizard.attachments.length} file
              {wizard.attachments.length > 1 ? "s" : ""} attached.
            </p>
          ) : (
            <p className="text-sm text-slate-400">No files attached.</p>
          )}
        </section>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between border-t border-surface-soft/60 pt-4">
        <button
          type="button"
          onClick={() => wizard.setStep(2)}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-full border border-glass-soft bg-surface-soft/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-emerald-400/70 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>←</span>
          <span>Edit details</span>
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-glass-md transition hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-3 w-3 animate-spin rounded-full border border-slate-900 border-t-transparent" />
          )}
          <span>{isSubmitting ? "Submitting…" : "Submit complaint"}</span>
        </button>
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-medium text-slate-400">
        {label}
      </p>
      <p
        className={[
          "text-sm text-slate-100",
          multiline ? "whitespace-pre-wrap" : "truncate",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
