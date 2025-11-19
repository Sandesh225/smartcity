// FILE: components/citizen/complaints/detail/ComplaintDetailShell.tsx
"use client";

import type { ComplaintSummaryViewModel } from "./types";
import { ComplaintHeader } from "./ComplaintHeader";
import { ComplaintInfoPanel } from "./ComplaintInfoPanel";
import { ComplaintDescriptionPanel } from "./ComplaintDescriptionPanel";
import { ResolutionNotesPanel } from "./ResolutionNotesPanel";
import { StatusTimeline } from "./StatusTimeline";
import { WorkUpdates } from "./WorkUpdates";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackDisplay } from "./FeedbackDisplay";

interface ComplaintDetailShellProps {
  summary: ComplaintSummaryViewModel;
  canProvideFeedback: boolean;
  onFeedbackSubmitted: () => void;
}

export function ComplaintDetailShell({
  summary,
  canProvideFeedback,
  onFeedbackSubmitted,
}: ComplaintDetailShellProps) {
  const { complaint, status_history, work_logs, feedback } = summary;

  return (
    <div className="space-y-5">
      <ComplaintHeader summary={summary} canProvideFeedback={canProvideFeedback} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="space-y-4">
          <ComplaintInfoPanel summary={summary} />
          <ComplaintDescriptionPanel description={complaint.description} />
          {complaint.resolution_notes && (
            <ResolutionNotesPanel notes={complaint.resolution_notes} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <StatusTimeline history={status_history} />
          <WorkUpdates logs={work_logs} />
          {canProvideFeedback && (
            <FeedbackForm
              complaintId={complaint.id}
              onSubmitted={onFeedbackSubmitted}
            />
          )}
          {feedback && <FeedbackDisplay feedback={feedback} />}
        </div>
      </div>
    </div>
  );
}
