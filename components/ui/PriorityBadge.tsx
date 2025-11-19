

// FILE: components/ui/PriorityBadge.tsx
type PriorityBadgeProps = {
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    low: { label: 'Low', className: 'badge-priority low' },
    medium: { label: 'Medium', className: 'badge-priority medium' },
    high: { label: 'High', className: 'badge-priority high' },
    critical: { label: 'Critical', className: 'badge-priority high' },
  };

  const { label, className } = config[priority];

  return <span className={className}>{label}</span>;
}
