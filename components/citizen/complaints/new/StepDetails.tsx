// FILE: components/citizen/complaints/new/StepDetails.tsx
import { useState, type ChangeEvent } from "react";
import { useWards } from "@/hooks/useWards";
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";
import { AttachmentGrid } from "./AttachmentGrid";

type FieldErrors = Record<string, string>;

export function StepDetails() {
  const {
    title,
    description,
    locationAddress,
    locationLandmark,
    wardId,
    wardLabel,
    latitude,
    attachments,
    setTitle,
    setDescription,
    setLocationAddress,
    setLocationLandmark,
    setWard,
    setAttachments,
    removeAttachment,
    setStep,
    selectedCategory,
    maxAttachmentSizeMb,
  } = useCitizenComplaintWizard();

  const { wards } = useWards();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const validate = () => {
    const next: FieldErrors = {};

    if (!title.trim()) {
      next.title = "Title is required.";
    } else if (title.trim().length < 10) {
      next.title = "Title must be at least 10 characters long.";
    }

    if (!description.trim()) {
      next.description = "Description is required.";
    } else if (description.trim().length < 20) {
      next.description = "Description must be at least 20 characters long.";
    }

    if (!locationAddress.trim() && !latitude) {
      next.location =
        "Please provide a location address or clearly describe where this issue is.";
    }

    if (!wardId) {
      next.ward = "Please select a ward.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(3);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const maxSizeBytes = maxAttachmentSizeMb * 1024 * 1024;
    let localError: string | null = null;

    const nextAttachments = files
      .filter((file) => {
        if (file.size > maxSizeBytes) {
          localError = `File "${file.name}" exceeds the ${maxAttachmentSizeMb}MB limit.`;
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    if (localError) {
      setAttachmentError(localError);
    } else {
      setAttachmentError(null);
    }

    if (nextAttachments.length > 0) {
      setAttachments([...attachments, ...nextAttachments]);
    }

    // reset file input to allow re-selecting same file
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
          Complaint details
        </h2>
        <p className="max-w-xl text-sm text-slate-400">
          Provide clear information so your ward or department can investigate
          and respond quickly.
        </p>
      </header>

      {selectedCategory && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.3)]" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Selected category
            </p>
            <p className="text-sm text-slate-50">
              {selectedCategory.category_name}
            </p>
            <p className="text-[11px] text-emerald-100/80">
              Default priority:{" "}
              <span className="capitalize">
                {selectedCategory.default_priority}
              </span>
              {selectedCategory.sla_hours && (
                <> · Target response: {selectedCategory.sla_hours}h</>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <FieldLabel label="Complaint title" required />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Briefly describe the issue (e.g., Large pothole on main road)"
            className={[
              "w-full rounded-xl border bg-surface-soft/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0",
              errors.title ? "border-red-500/70" : "border-glass-soft",
            ].join(" ")}
          />
          {errors.title && <FieldError message={errors.title} />}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <FieldLabel label="Description" required />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe what is happening, since when, and how it affects you or others..."
            className={[
              "w-full rounded-xl border bg-surface-soft/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500",
              "resize-y min-h-[120px]",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0",
              errors.description ? "border-red-500/70" : "border-glass-soft",
            ].join(" ")}
          />
          {errors.description && <FieldError message={errors.description} />}
        </div>

        {/* Ward */}
        <div className="space-y-1.5">
          <FieldLabel label="Ward" required />
          <select
            value={wardId || ""}
            onChange={(e) => {
              const value = e.target.value || null;
              const ward = wards.find((w) => w.id === value);
              setWard(
                value,
                ward ? `Ward ${ward.ward_number} · ${ward.ward_name}` : ""
              );
            }}
            className={[
              "w-full rounded-xl border bg-surface-soft/80 px-3 py-2 text-sm text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0",
              errors.ward ? "border-red-500/70" : "border-glass-soft",
            ].join(" ")}
          >
            <option value="">Select ward…</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.ward_number} · {ward.ward_name}
              </option>
            ))}
          </select>
          {errors.ward && <FieldError message={errors.ward} />}
          {wardLabel && (
            <p className="text-[11px] text-emerald-300">
              Serving area: {wardLabel}
            </p>
          )}
        </div>

        {/* Location address */}
        <div className="space-y-1.5">
          <FieldLabel label="Location address" required />
          <input
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Street name, area, or nearby place"
            className={[
              "w-full rounded-xl border bg-surface-soft/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0",
              errors.location ? "border-red-500/70" : "border-glass-soft",
            ].join(" ")}
          />
          {errors.location && <FieldError message={errors.location} />}
          <p className="text-[11px] text-slate-500">
            The more precise your location, the faster teams can find and fix
            the issue.
          </p>
        </div>

        {/* Landmark */}
        <div className="space-y-1.5">
          <FieldLabel label="Nearby landmark" />
          <input
            type="text"
            value={locationLandmark}
            onChange={(e) => setLocationLandmark(e.target.value)}
            placeholder="e.g., Near Lakeside Temple, behind City Hall"
            className="w-full rounded-xl border border-glass-soft bg-surface-soft/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-1.5">
          <FieldLabel label="Attachments" />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-glass-soft bg-surface-soft/80 px-3 py-1.5 text-[13px] font-medium text-slate-200 transition hover:border-emerald-400/70 hover:text-emerald-200">
            <span className="text-sm">＋</span>
            <span>Add photos or videos</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-[11px] text-slate-500">
            Max {maxAttachmentSizeMb}MB per file. Images and videos only.
          </p>
          {attachmentError && <FieldError message={attachmentError} />}
        </div>

        {attachments.length > 0 && (
          <AttachmentGrid attachments={attachments} onRemove={removeAttachment} />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between border-t border-surface-soft/60 pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-glass-soft bg-surface-soft/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
        >
          <span>←</span>
          <span>Back to category</span>
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-glass-md transition hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98]"
        >
          <span>Continue to review</span>
          <span className="text-sm">→</span>
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
      <span>{label}</span>
      {required && <span className="text-red-400">*</span>}
    </label>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-[11px] text-red-400">
      {message}
    </p>
  );
}
