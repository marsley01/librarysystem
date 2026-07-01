import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint accepts public form submissions (no auth required).
// It uses the service role key directly because the form is pre-signup.
// Tradeoff: The service role key is not exposed to the client — only this serverless function uses it.
// We use the anon key with a permissive RLS policy instead to avoid exposing the service role key.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolName, contactName, email, phone, studentCount, message } = body;

    if (!schoolName || !contactName || !email || !phone || !studentCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Use anon key — RLS allows anonymous inserts on demo_requests
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
      return NextResponse.json(
        { error: 'Failed to submit request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Demo request error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
