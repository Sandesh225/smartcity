// FILE: components/citizen/complaints/new/AttachmentGrid.tsx
import type { LocalAttachment } from "@/stores/useCitizenComplaintWizard";

type AttachmentGridProps = {
  attachments: LocalAttachment[];
  onRemove: (id: string) => void;
};

export function AttachmentGrid({ attachments, onRemove }: AttachmentGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="group relative overflow-hidden rounded-2xl border border-glass-soft bg-surface-soft/80"
        >
          <img
            src={att.previewUrl}
            alt={att.file.name}
            className="h-24 w-full object-cover sm:h-28"
          />
          <button
            type="button"
            onClick={() => onRemove(att.id)}
            className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-[11px] text-white opacity-0 shadow-lg transition group-hover:opacity-100"
            aria-label={`Remove file ${att.file.name}`}
          >
            ×
          </button>
          <div className="bg-gradient-to-t from-surface-deep/95 via-surface-deep/40 to-transparent px-2 pb-2 pt-4 text-[10px] text-slate-200">
            <p className="truncate">{att.file.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
