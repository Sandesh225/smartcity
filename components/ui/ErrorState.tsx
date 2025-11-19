
// FILE: components/ui/ErrorState.tsx
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel,
  actionHref,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 w-16 h-16 rounded-2xl bg-red-900/30 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-secondary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
