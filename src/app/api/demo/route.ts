import { createClient } from '@supabase/supabase-js';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { ValidationError, AuthError } from '@/lib/errors';

export const POST = createRouteHandler(async (request: Request) => {
  const body = await request.json();
  const { schoolName, contactName, email, phone, studentCount, message } = body;

  if (!schoolName || !contactName || !email || !phone || !studentCount) {
    throw new ValidationError('Missing required fields');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new AuthError('Supabase not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase.from('demo_requests').insert({
    school_name: schoolName,
    contact_name: contactName,
    email,
    phone,
    student_count: studentCount,
    message: message || null,
  });

  if (error) {
    console.error('Demo request insert error:', error);
    throw new Error('Failed to submit request');
  }

  return jsonResponse({ success: true });
}, { rateLimit: 'strict' });
