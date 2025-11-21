import { createClient } from '@/lib/supabase/server';
import { UserRole } from './roles';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getEffectiveRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_effective_role');
  
  if (error || !data) return null;
  return data as UserRole;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
}