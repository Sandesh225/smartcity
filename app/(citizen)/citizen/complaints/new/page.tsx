// FILE: app/(citizen)/citizen/complaints/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";
import { NewComplaintWizardShell } from "@/components/citizen/complaints/new/NewComplaintWizardShell";
import { StepSuccess } from "@/components/citizen/complaints/new/StepSuccess";

export default function NewComplaintPage() {
  const router = useRouter();
  const { step, reset } = useCitizenComplaintWizard();
  const [submittedId] = useState<string | null>(null);

  const handleSuccessContinue = () => {
    reset();
    router.push("/citizen/complaints");
  };

  // Success state (step 4 or any future submittedId)
  if (step === 4 || submittedId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface-root px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {/* Optional small breadcrumb back to list */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/citizen/complaints"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300"
            >
              <span>←</span>
              <span>Back to complaints</span>
            </Link>
          </div>

          <StepSuccess onContinue={handleSuccessContinue} />
        </div>
      </div>
    );
  }

  // Default wizard shell
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-root px-4 py-6 sm:px-6 lg:px-8">
      <NewComplaintWizardShell />
    </div>
  );
}
