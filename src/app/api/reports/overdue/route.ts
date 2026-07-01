import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: records } = await supabase
    .from('borrow_records')
    .select('*, book:books(title)')
    .eq('school_id', profile.school_id)
    .in('status', ['borrowed', 'overdue'])
    .lt('expected_return_date', new Date().toISOString().split('T')[0])
    .order('expected_return_date', { ascending: true });

  let csv = 'Student,Admission,Class,Book,Expected Return,Days Overdue,Fine\n';

  if (records) {
    records.forEach((r: any) => {
      const days = Math.ceil(
        (new Date().getTime() - new Date(r.expected_return_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      csv += `"${r.student_name}","${r.admission_number}","${r.student_class}","${r.book?.title || ''}","${r.expected_return_date}",${days},${r.fine_amount}\n`;
    });
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="overdue-report.csv"',
    },
  });
}
