//components/admin/notices/AdminNoticeForm
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import type { NoticeType, NoticeStatus, WardOption, DepartmentOption } from './types';

type AdminNoticeFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<NoticeFormValues>;
  wards: WardOption[];
  departments: DepartmentOption[];
  onSubmit: (formData: FormData) => Promise<void>;
};

export type NoticeFormValues = {
  id?: string;
  title: string;
  title_nepali: string | null;
  content: string;
  content_nepali: string | null;
  notice_type: NoticeType;
  status: NoticeStatus;
  published_date: string | null;
  expiry_date: string | null;
  is_featured: boolean;
  is_urgent: boolean;
  tags: string;
  related_ward_ids: string[];
  related_department_id: string | null;
};

export function AdminNoticeForm({
  mode,
  initialValues,
  wards,
  departments,
  onSubmit,
}: AdminNoticeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaults: NoticeFormValues = {
    id: initialValues?.id,
    title: initialValues?.title ?? '',
    title_nepali: initialValues?.title_nepali ?? '',
    content: initialValues?.content ?? '',
    content_nepali: initialValues?.content_nepali ?? '',
    notice_type: (initialValues?.notice_type as NoticeType) ?? 'general',
    status: (initialValues?.status as NoticeStatus) ?? 'draft',
    published_date: initialValues?.published_date ?? '',
    expiry_date: initialValues?.expiry_date ?? '',
    is_featured: initialValues?.is_featured ?? false,
    is_urgent: initialValues?.is_urgent ?? false,
    tags:
      initialValues?.tags && Array.isArray(initialValues.tags)
        ? initialValues.tags.join(', ')
        : '',
    related_ward_ids: (initialValues?.related_ward_ids as string[] | undefined) ?? [],
    related_department_id: initialValues?.related_department_id ?? '',
  };

  function handleSubmit(formEl: HTMLFormElement) {
    const formData = new FormData(formEl);
    setError(null);

    startTransition(async () => {
      try {
        await onSubmit(formData);
        // onSubmit will redirect on success
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to save notice');
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="card p-6 space-y-6 bg-slate-900/60 border border-slate-800"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="card-title text-lg font-semibold">
            {mode === 'create' ? 'Create Notice' : 'Edit Notice'}
          </h1>
          <p className="card-subtitle text-xs text-slate-400">
            Publish important city updates to the Citizen Portal.
          </p>
        </div>
      </div>

      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {error && (
        <div className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Title + Nepali title */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Title *
          </label>
          <input
            name="title"
            defaultValue={defaults.title}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. Scheduled Water Supply Maintenance"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Title (Nepali)
          </label>
          <input
            name="title_nepali"
            defaultValue={defaults.title_nepali ?? ''}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="शीर्षक (नेपालीमा)"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Content *
          </label>
          <textarea
            name="content"
            defaultValue={defaults.content}
            required
            rows={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="English content for the notice..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Content (Nepali)
          </label>
          <textarea
            name="content_nepali"
            defaultValue={defaults.content_nepali ?? ''}
            rows={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="नेपाली सामग्री यहाँ लेख्नुहोस्..."
          />
        </div>
      </div>

      {/* Type / Status / Dates */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Notice Type
          </label>
          <select
            name="notice_type"
            defaultValue={defaults.notice_type}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="general">General</option>
            <option value="tender">Tender</option>
            <option value="public_hearing">Public Hearing</option>
            <option value="emergency">Emergency</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
          <select
            name="status"
            defaultValue={defaults.status}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Published Date
          </label>
          <input
            type="datetime-local"
            name="published_date"
            defaultValue={
              defaults.published_date
                ? new Date(defaults.published_date).toISOString().slice(0, 16)
                : ''
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            If left blank and status = Published, defaults to now.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Expiry Date
          </label>
          <input
            type="datetime-local"
            name="expiry_date"
            defaultValue={
              defaults.expiry_date
                ? new Date(defaults.expiry_date).toISOString().slice(0, 16)
                : ''
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Flags & tags */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={defaults.is_featured}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
          />
          <label htmlFor="is_featured" className="text-xs font-medium text-slate-200">
            Featured notice
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="is_urgent"
            name="is_urgent"
            type="checkbox"
            defaultChecked={defaults.is_urgent}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-red-500 focus:ring-red-500"
          />
          <label htmlFor="is_urgent" className="text-xs font-medium text-slate-200">
            Mark as urgent
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            name="tags"
            defaultValue={defaults.tags}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="road, water, public-hearing"
          />
        </div>
      </div>

      {/* Ward / Department scoping */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Related Wards
          </label>
          <select
            name="related_ward_ids"
            multiple
            defaultValue={defaults.related_ward_ids}
            className="w-full min-h-[90px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                Ward {w.ward_number}: {w.ward_name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            Hold Ctrl/Cmd to select multiple wards.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Related Department
          </label>
          <select
            name="related_department_id"
            defaultValue={defaults.related_department_id ?? ''}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">None</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Create Notice' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}