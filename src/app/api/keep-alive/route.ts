import { createClient } from '@supabase/supabase-js';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = createRouteHandler(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase.from('books').select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Keep-alive query error:', error);
    throw new Error('Database ping failed');
  }

  return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
}, { rateLimit: false });
