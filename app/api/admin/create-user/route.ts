// app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.role) {
      return NextResponse.json(
        { error: 'Could not load profile' },
        { status: 403 }
      );
    }

    if (profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, role, ward_id } = body as {
      full_name: string;
      email: string;
      role: 'staff' | 'admin';
      ward_id?: string | null;
    };

    if (!full_name || !email || !['staff', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // 1. Create user via admin API
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: {
          full_name,
          ward_id: ward_id || null,
        },
      });

    if (createError || !created?.user) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    const newUserId = created.user.id;

    // 2. Update user_profiles with role + ward
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role,
        ward_id: ward_id || null,
        is_verified: false,
      })
      .eq('id', newUserId);

    if (updateError) {
      return NextResponse.json(
        {
          error:
            updateError.message ||
            'User created, but failed to update user profile.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        user_id: newUserId,
        email,
        role,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('create-user error', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}