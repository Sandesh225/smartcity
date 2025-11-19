// FILE: components/citizen/dashboard/ErrorBanner.tsx
'use client';

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";

type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-50 shadow-[0_18px_55px_rgba(127,29,29,0.75)] sm:px-4 sm:py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-2">
          <div className="mt-[1px] flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold sm:text-xs">
              Something went wrong
            </p>
            <p className="mt-1 text-[11px] text-rose-100/80">{message}</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-rose-400/60 bg-rose-500/15 px-2 py-1 text-[10px] font-medium text-rose-50 hover:bg-rose-500/25"
          onClick={() => setShowDetails((v) => !v)}
        >
          <span>Details</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {showDetails && (
        <p className="mt-2 text-[10px] text-rose-100/80">
          This is usually a temporary issue with the network or the server.
          Please refresh the page or try again in a few minutes.
        </p>
      )}
    </div>
  );
}
