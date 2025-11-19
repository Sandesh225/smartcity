
// =====================================================================
// hooks/useSignedUrl.ts
// Fetch signed URLs for private attachments
// =====================================================================

import { useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export function useSignedUrl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = useCallback(
    async (storagePath: string, bucket: 'complaint-attachments' | 'complaint-attachments-public' = 'complaint-attachments'): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/attachments/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storage_path: storagePath,
            bucket,
            expires_in: 3600,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sign URL');
        }

        const { url } = await response.json();
        return url;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getSignedUrl, loading, error };
}
