"use client";

import { useState, useRef } from "react";
import { useComplaintAttachmentUpload } from "@/hooks/useComplaintAttachmentUpload";
import { Upload, X } from "lucide-react";

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
  accept = "image/*,video/*",
}: FileUploadInputProps) {
  const { uploadAttachment, uploading, uploadProgress, error } =
    useComplaintAttachmentUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(
        `File exceeds ${maxFileSizeMb}MB limit (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const result = await uploadAttachment(file, complaintId);

    if (result.success && result.url) {
      onUploadSuccess(result.path || "", result.url);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const openPicker = () => inputRef.current?.click();

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

      {/* Idle / CTA */}
      {!preview && !uploading && (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-center hover:border-emerald-500/70 hover:bg-slate-900/60 transition-all disabled:opacity-50"
        >
          <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-200">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {accept === "image/*,video/*"
              ? `Images and videos up to ${maxFileSizeMb}MB`
              : `Files up to ${maxFileSizeMb}MB`}
          </p>
        </button>
      )}

      {/* Uploading */}
      {uploading && (
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">Uploading… {uploadProgress}%</p>
        </div>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="relative rounded-lg overflow-hidden border border-slate-800">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 rounded-full bg-slate-900/90 p-1.5 text-slate-100 hover:bg-red-600/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-950/30 border border-red-900 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
