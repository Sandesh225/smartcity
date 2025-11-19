// FILE: components/citizen/complaints/detail/utils.ts
import type { ComplaintPriority, ComplaintStatus } from "./types";

export function formatStatusLabel(status: ComplaintStatus | string): string {
  const normalized = status as ComplaintStatus;
  switch (normalized) {
    case "new":
      return "New";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "rejected":
      return "Rejected";
    default:
      return String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatTimeAgo(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 45) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatDate(value);
}

export function getStatusTone(
  status: ComplaintStatus | string
): { bg: string; text: string; dot: string; ring?: string } {
  const normalized = status as ComplaintStatus;
  switch (normalized) {
    case "new":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-200",
        dot: "bg-sky-400",
        ring: "ring-1 ring-sky-400/40",
      };
    case "in_progress":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-200",
        dot: "bg-amber-400",
        ring: "ring-1 ring-amber-400/40",
      };
    case "resolved":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-200",
        dot: "bg-emerald-400",
        ring: "ring-1 ring-emerald-400/40",
      };
    case "closed":
      return {
        bg: "bg-slate-600/20",
        text: "text-slate-200",
        dot: "bg-slate-300",
      };
    case "rejected":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-200",
        dot: "bg-rose-400",
        ring: "ring-1 ring-rose-400/40",
      };
    default:
      return {
        bg: "bg-slate-700/30",
        text: "text-slate-100",
        dot: "bg-slate-300",
      };
  }
}

export function getPriorityTone(
  priority: ComplaintPriority
): { bg: string; text: string; border: string } {
  switch (priority) {
    case "low":
      return {
        bg: "bg-slate-800/70",
        text: "text-slate-200",
        border: "border-slate-600/70",
      };
    case "medium":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-200",
        border: "border-sky-500/40",
      };
    case "high":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-200",
        border: "border-amber-500/40",
      };
    case "critical":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-200",
        border: "border-rose-500/50",
      };
    default:
      return {
        bg: "bg-slate-800/70",
        text: "text-slate-200",
        border: "border-slate-600/70",
      };
  }
}

export function getCitizenSummaryLine(status: ComplaintStatus | string): string {
  const normalized = status as ComplaintStatus;
  switch (normalized) {
    case "new":
      return "Your complaint has been received and is waiting for a municipal officer to review it.";
    case "in_progress":
      return "This complaint is currently in progress and is being handled by the municipal team.";
    case "resolved":
      return "This complaint has been resolved. You can review the resolution notes and share your feedback.";
    case "closed":
      return "This complaint has been closed by the municipality.";
    case "rejected":
      return "This complaint was rejected. Please review the notes or contact the municipality if you have questions.";
    default:
      return "This complaint is being tracked by the municipality.";
  }
}
