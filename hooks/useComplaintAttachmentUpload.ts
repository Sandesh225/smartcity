
// =====================================================================
// PART 3: COMPLAINT ATTACHMENT UPLOAD HOOK
// =====================================================================

// hooks/useComplaintAttachmentUpload.ts
import { useState } from 'react';
import { storageService } from '@/lib/storageService';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export function useComplaintAttachmentUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAttachment = async (
    file: File,
    complaintId: string
  ): Promise<{ success: boolean; path?: string; url?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Generate unique path
      const path = storageService.generatePath(
        `complaints/${complaintId}`,
        user.id,
        file.name
      );

      // Upload file
      const uploadResult = await storageService.uploadFile({
        bucket: 'complaint-attachments',
        path,
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
        return uploadResult;
      }

      // Save metadata to database
      const { error: dbError } = await supabaseBrowser
        .from('complaint_attachments')
        .insert({
          complaint_id: complaintId,
          file_name: file.name,
          file_type: file.type,
          file_size_bytes: file.size,
          file_url: uploadResult.url,
          storage_path: uploadResult.path,
          uploaded_by: user.id,
        });

      if (dbError) {
        setError(`Failed to save attachment metadata: ${dbError.message}`);
        // Cleanup uploaded file
        await storageService.deleteFile(
          'complaint-attachments',
          uploadResult.path!
        );
        return { success: false, error: dbError.message };
      }

      setUploadProgress(100);
      return uploadResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setUploading(false);
    }
  };

  return { uploadAttachment, uploading, uploadProgress, error };
}
