
// FILE: components/ui/StatusBadge.tsx
type StatusBadgeProps = {
  status: 'new' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    new: { label: 'New', className: 'badge-status new' },
    in_progress: { label: 'In Progress', className: 'badge-status in-progress' },
    resolved: { label: 'Resolved', className: 'badge-status resolved' },
    closed: { label: 'Closed', className: 'badge-status closed' },
    rejected: { label: 'Rejected', className: 'badge-status closed' },
  };

  const { label, className } = config[status];

  return (
    <span className={className}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
}