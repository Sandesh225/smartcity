

// =====================================================================
// PART 5: API ROUTE FOR BUCKET INITIALIZATION (Next.js)
// =====================================================================

// app/api/admin/init-buckets/route.ts
import { initializeBuckets, setBucketPolicies } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Verify admin/internal request (add proper authentication in production)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initializeBuckets();
    await setBucketPolicies();

    return NextResponse.json(
      { success: true, message: 'Buckets initialized successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bucket initialization failed:', error);
    return NextResponse.json(
      {
        error: 'Bucket initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}