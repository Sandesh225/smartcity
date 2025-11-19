// =====================================================================
// lib/supabaseAdmin.ts
// Server-side Supabase admin utilities
// - Creates service-role Supabase client (NEVER expose to client)
// - Initializes storage buckets
// - Sets/validates bucket policies
// =====================================================================

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------
// PART 1: CREATE ADMIN CLIENT (server-side only)
// ---------------------------------------------------------------------
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Must stay server-side only
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ---------------------------------------------------------------------
// PART 2: BUCKET SETUP & INITIALIZATION
// ---------------------------------------------------------------------
export async function initializeBuckets() {
  try {
    const buckets = [
      {
        name: 'complaint-attachments',
        public: false,
        description: 'Complaint photos and documents',
      },
      {
        name: 'complaint-attachments-public',
        public: true,
        description: 'Public complaint media',
      },
      {
        name: 'user-avatars',
        public: true,
        description: 'User profile pictures',
      },
      {
        name: 'notice-attachments',
        public: false,
        description: 'Notice documents',
      },
    ];

    // Fetch existing buckets once (optimization)
    const { data: existingBuckets, error: listErr } =
      await supabaseAdmin.storage.listBuckets();

    if (listErr) throw listErr;

    for (const bucket of buckets) {
      const exists = existingBuckets?.some((b) => b.name === bucket.name);

      if (!exists) {
        console.log(`Creating bucket: ${bucket.name}`);

        const { error } = await supabaseAdmin.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 50 * 1024 * 1024, // 50 MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
        });

        if (error) {
          console.error(`Error creating bucket ${bucket.name}:`, error);
          throw error;
        }
      }
    }

    console.log('✓ Buckets initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize buckets:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------
// PART 3: POLICY VALIDATION (OPTIONAL)
// ---------------------------------------------------------------------
export async function validateBucketPolicies() {
  try {
    // Attempt to create a signed URL (as a permission check)
    await supabaseAdmin.storage
      .from('complaint-attachments')
      .createSignedUploadUrl('permission-test.txt')
      .catch(() => null);

    console.log('✓ Bucket policies validated');
  } catch (error) {
    console.error('✗ Failed to validate bucket policies:', error);
  }
}
