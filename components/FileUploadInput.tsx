
// =====================================================================
// PART 4: FILE UPLOAD COMPONENT
// =====================================================================

// components/FileUploadInput.tsx
'use client';

import { useState, useRef } from 'react';
import { useComplaintAttachmentUpload } from '@/hooks/useComplaintAttachmentUpload';

interface FileUploadInputProps {
  complaintId: string;
  onUploadSuccess: (path: string, url: string) => void;
  maxFileSizeMb?: number;
  accept?: string;
}

export function FileUploadInput({
  complaintId,
  onUploadSuccess,
  maxFileSizeMb = 50,
  accept = 'image/*,video/*',
}: FileUploadInputProps) {
  const { uploadAttachment, uploading, uploadProgress, error } =
    useComplaintAttachmentUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(
        `File exceeds ${maxFileSizeMb}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const result = await uploadAttachment(file, complaintId);

    if (result.success && result.url) {
      onUploadSuccess(result.path || '', result.url);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelect}
        accept={accept}
        disabled={uploading}
        className="hidden"
      />

      {!preview && !uploading && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 px-4 py-8 text-center hover:border-slate-600 disabled:opacity-50"
        >
          <svg
            className="mx-auto h-8 w-8 text-slate-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
            />
          </svg>
          <p className="text-sm text-slate-300">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">
            {accept === 'image/*,video/*'
              ? 'Images and videos up to 50MB'
              : `Files up to ${maxFileSizeMb}MB`}
          </p>
        </button>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {preview && !uploading && (
        <div className="relative rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
          <button
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-950/30 border border-red-900 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}