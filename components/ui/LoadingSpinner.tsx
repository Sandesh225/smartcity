
// =====================================================================
// 4. SHARED UI COMPONENTS
// =====================================================================

// FILE: components/ui/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-500 mb-3`} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}


