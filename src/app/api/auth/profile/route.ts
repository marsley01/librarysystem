import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { AuthError } from '@/lib/errors';

export const GET = createRouteHandler(async () => {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError();
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthError('Profile not found');
  }

  return jsonResponse(profile);
}, { rateLimit: 'auth' });
