// components/citizen/complaints/ErrorBanner.tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-100 shadow-[0_18px_50px_rgba(127,29,29,0.6)] md:px-4 md:py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <p>{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-full border border-rose-500/60 bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-50 hover:bg-rose-500/25"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
