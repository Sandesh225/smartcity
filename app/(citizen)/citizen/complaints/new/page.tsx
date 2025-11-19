// =====================================================================
// NEW COMPLAINT SUBMISSION WIZARD
// Multi-step form with validation, file upload, and location selection
// =====================================================================

// app/(citizen)/citizen/complaints/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';
import { useComplaintCategories } from '@/hooks/useComplaintCategories';
import { useWards } from '@/hooks/useWards';
import { useSubmitComplaint } from '@/hooks/useSubmitComplaint';
import Link from 'next/link';

export default function NewComplaintPage() {
  const router = useRouter();
  const { step, setStep, reset } = useCitizenComplaintWizard();
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleComplete = () => {
    // After successful submission, wizard automatically goes to step 4
    // You can add additional logic here if needed
  };

  if (step === 4 || submittedId) {
    return <SuccessView onContinue={() => {
      reset();
      router.push('/citizen/complaints');
    }} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <section className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="card-title">Submit New Complaint</h1>
            <p className="card-subtitle">
              Report city issues and track their resolution
            </p>
          </div>
          <Link href="/citizen/complaints" className="btn-secondary text-xs">
            Cancel
          </Link>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="card">
        <WizardProgress />
      </section>

      {/* Step Content */}
      <section className="card">
        {step === 1 && <Step1CategorySelection />}
        {step === 2 && <Step2ComplaintDetails />}
        {step === 3 && <Step3ReviewAndSubmit />}
      </section>
    </div>
  );
}

function WizardProgress() {
  const { step } = useCitizenComplaintWizard();
  
  const steps = [
    { num: 1, label: 'Select Category' },
    { num: 2, label: 'Complaint Details' },
    { num: 3, label: 'Review & Submit' },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((s, idx) => (
        <div key={s.num} className="flex items-center flex-1">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                step >= s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s.num ? 'text-slate-200' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="mx-4 h-px flex-1 bg-slate-700" />
          )}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// STEP 1: CATEGORY SELECTION
// =====================================================================

function Step1CategorySelection() {
  const { categories, loading } = useComplaintCategories();
  const { selectedCategory, setCategory, setStep } = useCitizenComplaintWizard();

  const handleSelect = (cat: any) => {
    setCategory(cat);
    setStep(2);
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Select Complaint Category
        </h2>
        <p className="text-sm text-slate-400">
          Choose the category that best describes your complaint
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat)}
            className={`group relative overflow-hidden rounded-lg border p-4 text-left transition-all ${
              selectedCategory?.id === cat.id
                ? 'border-emerald-500 bg-emerald-950/50'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-slate-100 mb-1">
                  {cat.category_name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`badge-priority ${cat.default_priority}`}>
                    {cat.default_priority}
                  </span>
                  {cat.sla_hours && (
                    <span className="text-[10px] text-slate-500">
                      SLA: {cat.sla_hours}h
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-600">
                {selectedCategory?.id === cat.id && (
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// STEP 2: COMPLAINT DETAILS
// =====================================================================

function Step2ComplaintDetails() {
  const {
    title,
    description,
    locationAddress,
    locationLandmark,
    wardId,
    wardLabel,
    latitude,
    longitude,
    attachments,
    setTitle,
    setDescription,
    setLocationAddress,
    setLocationLandmark,
    setWard,
    setCoords,
    setAttachments,
    removeAttachment,
    setStep,
    selectedCategory,
    maxAttachmentSizeMb,
  } = useCitizenComplaintWizard();

  const { wards } = useWards();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!locationAddress.trim() && !latitude) {
      newErrors.location = 'Please provide location address or select on map';
    }

    if (!wardId) {
      newErrors.ward = 'Please select a ward';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(3);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const maxSizeBytes = maxAttachmentSizeMb * 1024 * 1024;

    const newAttachments = files
      .filter((file) => {
        if (file.size > maxSizeBytes) {
          alert(`File ${file.name} exceeds ${maxAttachmentSizeMb}MB limit`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setAttachments([...attachments, ...newAttachments]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Complaint Details
        </h2>
        <p className="text-sm text-slate-400">
          Provide detailed information about the issue
        </p>
      </div>

      {/* Selected Category Display */}
      {selectedCategory && (
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3">
          <p className="text-xs font-medium text-emerald-400 mb-1">
            Selected Category
          </p>
          <p className="text-sm text-slate-200">{selectedCategory.category_name}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Complaint Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue (e.g., Large pothole on main road)"
            className={`w-full rounded-lg border ${
              errors.title ? 'border-red-500' : 'border-slate-700'
            } bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500`}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Provide detailed information about the issue, when you noticed it, and its impact..."
            className={`w-full rounded-lg border ${
              errors.description ? 'border-red-500' : 'border-slate-700'
            } bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500`}
          />
          {errors.description && (
            <p className="text-xs text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Ward Selection */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Ward *
          </label>
          <select
            value={wardId || ''}
            onChange={(e) => {
              const ward = wards.find((w) => w.id === e.target.value);
              setWard(
                e.target.value,
                ward ? `Ward ${ward.ward_number} - ${ward.ward_name}` : ''
              );
            }}
            className={`w-full rounded-lg border ${
              errors.ward ? 'border-red-500' : 'border-slate-700'
            } bg-slate-900 px-3 py-2 text-sm text-slate-100`}
          >
            <option value="">Select ward...</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.ward_number} - {ward.ward_name}
              </option>
            ))}
          </select>
          {errors.ward && (
            <p className="text-xs text-red-400 mt-1">{errors.ward}</p>
          )}
        </div>

        {/* Location Address */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Location Address *
          </label>
          <input
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Street address or nearby landmark"
            className={`w-full rounded-lg border ${
              errors.location ? 'border-red-500' : 'border-slate-700'
            } bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500`}
          />
          {errors.location && (
            <p className="text-xs text-red-400 mt-1">{errors.location}</p>
          )}
        </div>

        {/* Landmark (optional) */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Nearby Landmark (optional)
          </label>
          <input
            type="text"
            value={locationLandmark}
            onChange={(e) => setLocationLandmark(e.target.value)}
            placeholder="e.g., Near Lakeside Temple, Behind City Hall"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            Attachments (optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-700"
          />
          <p className="text-xs text-slate-400 mt-1">
            Max {maxAttachmentSizeMb}MB per file. Images and videos only.
          </p>
        </div>

        {/* Preview Attachments */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {attachments.map((att) => (
              <div key={att.id} className="relative group">
                <img
                  src={att.previewUrl}
                  alt={att.file.name}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {att.file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          onClick={() => setStep(1)}
          className="btn-secondary"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// STEP 3: REVIEW & SUBMIT
// =====================================================================

function Step3ReviewAndSubmit() {
  const wizard = useCitizenComplaintWizard();
  const { submit, isSubmitting } = useSubmitComplaint();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Review Your Complaint
        </h2>
        <p className="text-sm text-slate-400">
          Please verify all information before submitting
        </p>
      </div>

      <div className="space-y-4">
        <ReviewField label="Category" value={wizard.selectedCategory?.category_name || ''} />
        <ReviewField label="Title" value={wizard.title} />
        <ReviewField label="Description" value={wizard.description} multiline />
        <ReviewField label="Ward" value={wizard.wardLabel} />
        <ReviewField label="Location" value={wizard.locationAddress} />
        {wizard.locationLandmark && (
          <ReviewField label="Landmark" value={wizard.locationLandmark} />
        )}
        {wizard.attachments.length > 0 && (
          <ReviewField
            label="Attachments"
            value={`${wizard.attachments.length} file(s)`}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          onClick={() => wizard.setStep(2)}
          disabled={isSubmitting}
          className="btn-secondary"
        >
          ← Edit Details
        </button>
        <button
          onClick={submit}
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
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
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className={`text-sm text-slate-200 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {value}
      </p>
    </div>
  );
}

// =====================================================================
// SUCCESS VIEW
// =====================================================================

function SuccessView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="card">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-900/30 flex items-center justify-center">
            <svg className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">
            Complaint Submitted Successfully!
          </h2>
          <p className="text-slate-400 mb-6">
            Your complaint has been registered and assigned a tracking ID. You will receive
            updates as it progresses through resolution.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={onContinue} className="btn-primary">
              View My Complaints
            </button>
            <Link href="/citizen/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}