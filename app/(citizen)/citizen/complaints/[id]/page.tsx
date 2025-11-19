
// =====================================================================
// PART 3: COMPLAINT DETAIL PAGE
// =====================================================================

// app/(citizen)/citizen/complaints/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useComplaintSummary } from '@/hooks/useComplaintSummary';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;
  const { summary, loading, errorText, load } = useComplaintSummary();
  const { user } = useAuth();

  useEffect(() => {
    if (complaintId) {
      load(complaintId);
    }
  }, [complaintId]);

  if (loading) {
    return <LoadingState />;
  }

  if (errorText) {
    return <ErrorState message={errorText} />;
  }

  if (!summary) {
    return <ErrorState message="Complaint not found" />;
  }

  const canProvideFeedback =
    (summary.complaint.status === 'resolved' || summary.complaint.status === 'closed') &&
    !summary.feedback &&
    summary.complaint.citizen_id === user?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-100">
                {summary.complaint.title}
              </h1>
              <StatusBadge status={summary.complaint.status} />
              {summary.complaint.is_overdue && (
                <span className="badge-priority high text-xs">Overdue</span>
              )}
            </div>
            <p className="text-sm text-slate-400 font-mono">
              {summary.complaint.tracking_id}
            </p>
          </div>
          <Link href="/citizen/complaints" className="btn-secondary text-xs">
            ← Back to List
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <ComplaintInfo complaint={summary.complaint} category={summary.category} ward={summary.ward} />
          <ComplaintDescription description={summary.complaint.description} />
          {summary.complaint.resolution_notes && (
            <ResolutionNotes notes={summary.complaint.resolution_notes} />
          )}
        </div>

        {/* Right Column: Timeline & Feedback */}
        <div className="space-y-6">
          <StatusTimeline history={summary.status_history} />
          <WorkLogs logs={summary.work_logs} />
          {canProvideFeedback && (
            <FeedbackForm complaintId={summary.complaint.id} onSubmit={() => load(complaintId)} />
          )}
          {summary.feedback && <FeedbackDisplay feedback={summary.feedback} />}
        </div>
      </div>
    </div>
  );
}

function ComplaintInfo({ complaint, category, ward }: any) {
  return (
    <section className="card">
      <h2 className="card-title mb-4">Complaint Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoRow label="Category" value={category.category_name} />
        <InfoRow label="Ward" value={`Ward ${ward.ward_number} - ${ward.ward_name}`} />
        <InfoRow label="Priority" value={<PriorityBadge priority={complaint.priority} />} />
        <InfoRow label="Created" value={new Date(complaint.created_at).toLocaleString()} />
        {complaint.sla_due_date && (
          <InfoRow label="SLA Due" value={new Date(complaint.sla_due_date).toLocaleString()} />
        )}
        {complaint.resolved_at && (
          <InfoRow label="Resolved" value={new Date(complaint.resolved_at).toLocaleString()} />
        )}
      </div>
      {complaint.location_address && (
        <div className="mt-4">
          <InfoRow label="Location" value={complaint.location_address} />
          {complaint.location_landmark && (
            <InfoRow label="Landmark" value={complaint.location_landmark} />
          )}
        </div>
      )}
    </section>
  );
}

function ComplaintDescription({ description }: { description: string }) {
  return (
    <section className="card">
      <h2 className="card-title mb-4">Description</h2>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{description}</p>
    </section>
  );
}

function ResolutionNotes({ notes }: { notes: string }) {
  return (
    <section className="card border-emerald-900/50 bg-emerald-950/30">
      <h2 className="card-title mb-4 text-emerald-400">Resolution Notes</h2>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{notes}</p>
    </section>
  );
}

function StatusTimeline({ history }: { history: any[] }) {
  return (
    <section className="card">
      <h2 className="card-title mb-4">Status Timeline</h2>
      <div className="space-y-3">
        {history.map((h, idx) => (
          <div key={h.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              {idx < history.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-1" />}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-slate-200">
                {h.to_status.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(h.changed_at).toLocaleString()}
              </p>
              {h.notes && <p className="text-xs text-slate-400 mt-1">{h.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkLogs({ logs }: { logs: any[] }) {
  const visibleLogs = logs.filter((l) => l.is_visible_to_citizen);

  if (visibleLogs.length === 0) return null;

  return (
    <section className="card">
      <h2 className="card-title mb-4">Work Updates</h2>
      <div className="space-y-3">
        {visibleLogs.map((log) => (
          <div key={log.id} className="border-l-2 border-slate-700 pl-3">
            <p className="text-sm text-slate-300">{log.log_content}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeedbackForm({ complaintId, onSubmit }: { complaintId: string; onSubmit: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setSubmitting(true);
    const { error } = await supabaseBrowser.from('complaint_feedback').insert({
      complaint_id: complaintId,
      citizen_id: user!.id,
      rating,
      feedback_comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      alert('Failed to submit feedback');
      return;
    }

    onSubmit();
  };

  return (
    <section className="card border-amber-900/50 bg-amber-950/30">
      <h2 className="card-title mb-4 text-amber-400">Provide Feedback</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-slate-600'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-200 mb-2 block">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            placeholder="Share your experience..."
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="btn-primary w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </section>
  );
}

function FeedbackDisplay({ feedback }: { feedback: any }) {
  return (
    <section className="card border-emerald-900/50 bg-emerald-950/30">
      <h2 className="card-title mb-4 text-emerald-400">Your Feedback</h2>
      <div className="space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-xl ${star <= feedback.rating ? 'text-amber-400' : 'text-slate-600'}`}>
              ★
            </span>
          ))}
        </div>
        {feedback.feedback_comment && (
          <p className="text-sm text-slate-300">{feedback.feedback_comment}</p>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-200">{typeof value === 'string' ? value : value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="card">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading complaint details...</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="card">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-900/30 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Error</h3>
          <p className="text-sm text-slate-400 mb-6">{message}</p>
          <Link href="/citizen/complaints" className="btn-secondary">
            ← Back to List
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    new: { label: 'New', class: 'badge-status new' },
    in_progress: { label: 'In Progress', class: 'badge-status in-progress' },
    resolved: { label: 'Resolved', class: 'badge-status resolved' },
    closed: { label: 'Closed', class: 'badge-status closed' },
    rejected: { label: 'Rejected', class: 'badge-status closed' },
  };

  const { label, class: className } = config[status as keyof typeof config] || config.new;

  return (
    <span className={className}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    low: { label: 'Low', class: 'badge-priority low' },
    medium: { label: 'Medium', class: 'badge-priority medium' },
    high: { label: 'High', class: 'badge-priority high' },
    critical: { label: 'Critical', class: 'badge-priority high' },
  };

  const { label, class: className } = config[priority as keyof typeof config] || config.medium;

  return <span className={className}>{label}</span>;
}