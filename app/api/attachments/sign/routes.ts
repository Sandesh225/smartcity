
// =====================================================================
// app/api/attachments/sign/route.ts
// Mint signed URLs for private complaint attachments
// =====================================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const signUrlSchema = z.object({
  storage_path: z.string(),
  bucket: z.enum(['complaint-attachments', 'complaint-attachments-public']),
  expires_in: z.number().int().positive().max(3600).default(3600),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = signUrlSchema.parse(body);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    const { data: session } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from(validated.bucket)
      .createSignedUrl(validated.storage_path, validated.expires_in);

    if (error) {
      console.error('Sign URL error:', error);
      return NextResponse.json(
        { error: 'Failed to sign URL' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { url: data.signedUrl },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      );
    }

    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
