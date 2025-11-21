// app/(admin)/admin/complaints/action.ts
'use server';

import { redirect } from 'next/navigation';
import { requireSessionAndProfile } from '@/lib/auth/server-profile';
import type { ComplaintStatus } from '@/components/admin/complaints/types';

/**
 * ADMIN / STAFF — Update complaint status
 */
export async function updateComplaintStatusAction(formData: FormData) {
  const { supabase, profile } = await requireSessionAndProfile('/admin/complaints');

  if (!['admin', 'super_admin', 'staff', 'officer'].includes(profile.role)) {
    throw new Error('Forbidden');
  }

  const complaintId = String(formData.get('complaint_id') || '');
  const nextStatus = formData.get('next_status') as ComplaintStatus | null;

  if (!complaintId || !nextStatus) {
    throw new Error('Missing complaint_id or next_status');
  }

  // Try using RPC if available
  const { error: rpcError } = await supabase.rpc('transition_complaint_status', {
    p_complaint_id: complaintId,
    p_new_status: nextStatus,
  });

  if (rpcError) {
    console.error('transition_complaint_status error', rpcError);

    // Fallback direct update
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId);

    if (updateError) {
      console.error('updateComplaintStatusAction fallback error', updateError);
      throw new Error('Failed to update complaint status');
    }
  }

  redirect('/admin/complaints');
}

/**
 * ADMIN / STAFF — Assign or reassign complaint to a staff member
 */
export async function assignComplaintAction(formData: FormData) {
  const { supabase, profile } = await requireSessionAndProfile('/admin/complaints');

  if (!['admin', 'super_admin', 'staff', 'officer'].includes(profile.role)) {
    throw new Error('Forbidden');
  }

  const complaintId = String(formData.get('complaint_id') || '');
  const assigneeIdRaw = formData.get('assignee_id');
  const assigneeId = assigneeIdRaw ? String(assigneeIdRaw) : null;

  if (!complaintId) {
    throw new Error('Missing complaint_id');
  }

  const payload: Record<string, unknown> = {
    assigned_to_user_id: assigneeId,
    assigned_at: assigneeId ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('complaints')
    .update(payload)
    .eq('id', complaintId);

  if (error) {
    console.error('assignComplaintAction error', error);
    throw new Error('Failed to assign complaint');
  }

  redirect('/admin/complaints');
}