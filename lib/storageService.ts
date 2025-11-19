
// =====================================================================
// PART 2: STORAGE SERVICE
// =====================================================================

// lib/storageService.ts - Client & server-side storage operations
import { supabaseBrowser } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type UploadOptions = {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export type UploadResult = {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
};

class StorageService {
  // Upload file (client-side, use authenticated client)
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    try {
      const { bucket, path, file, onProgress } = options;

      // Validate bucket exists
      const { data: buckets } = await supabaseBrowser.storage.listBuckets();
      if (!buckets?.some((b) => b.name === bucket)) {
        return {
          success: false,
          error: `Bucket "${bucket}" not found. Please ensure it exists in Supabase Storage.`,
        };
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        };
      }

      // Upload with progress
      const { data, error } = await supabaseBrowser.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      // Get public URL
      const { data: publicUrl } = supabaseBrowser.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: publicUrl.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string): string {
    try {
      const { data } = supabaseBrowser.storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      return '';
    }
  }

  // Generate signed URL (for private files)
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabaseBrowser.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }

  // Delete file
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabaseBrowser.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // List files in a folder
  async listFiles(
    bucket: string,
    folderPath: string = ''
  ): Promise<Array<{ name: string; id: string; updated_at: string }> | null> {
    try {
      const { data, error } = await supabaseBrowser.storage
        .from(bucket)
        .list(folderPath);

      if (error) {
        console.error('Error listing files:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error listing files:', error);
      return null;
    }
  }

  // Generate unique file path
  generatePath(
    prefix: string,
    userId: string,
    fileName: string
  ): string {
    const timestamp = Date.now();
    const ext = fileName.split('.').pop();
    const safeName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);

    return `${prefix}/${userId}/${timestamp}_${safeName}`;
  }
}

export const storageService = new StorageService();