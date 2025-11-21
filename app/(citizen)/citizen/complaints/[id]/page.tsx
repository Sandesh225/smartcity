// FILE: app/(citizen)/citizen/complaints/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useComplaintSummary } from "@/hooks/useComplaintSummary";
import { useAuth } from "@/hooks/useAuth";

import { ComplaintDetailShell } from "@/components/citizen/complaints/detail/ComplaintDetailShell";
import { DetailSkeleton } from "@/components/citizen/complaints/detail/DetailSkeleton";
import { DetailError } from "@/components/citizen/complaints/detail/DetailError";
import type { ComplaintSummaryViewModel } from "@/components/citizen/complaints/detail/types";

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const complaintId = params?.id;
  const { summary, loading, errorText, load } = useComplaintSummary();
  const { user } = useAuth();

  useEffect(() => {
    if (complaintId) {
      load(complaintId);
    }
  }, [complaintId, load]);

  // Initial load skeleton
  if (loading && !summary) {
    return <DetailSkeleton />;
  }

  if (errorText) {
    return (
      <DetailError
        message={errorText}
        onRetry={complaintId ? () => load(complaintId) : undefined}
      />
    );
  }

  if (!summary) {
    return <DetailError message="Complaint not found." showHomeLink />;
  }

  const typedSummary = summary as ComplaintSummaryViewModel;

  const canProvideFeedback =
    (typedSummary.complaint.status === "resolved" ||
      typedSummary.complaint.status === "closed") &&
    !typedSummary.feedback &&
    typedSummary.complaint.citizen_id === user?.id;

  return (
    <div className="space-y-6">
      <ComplaintDetailShell
        summary={typedSummary}
        canProvideFeedback={canProvideFeedback}
        onFeedbackSubmitted={() => {
          if (complaintId) load(complaintId);
        }}
      />
    </div>
  );
}
