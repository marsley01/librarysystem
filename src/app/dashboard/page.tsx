'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { BookOpen, ArrowUpFromLine, Clock, Coins } from 'lucide-react';
import type { DashboardStats, BorrowRecord, User } from '@/types/database';
import { formatDate, formatCurrency } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-5 transition-colors hover:border-[#2A2A35]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-[#6B6B7B]">{label}</p>
          <p className="font-heading text-2xl font-bold text-[#E8E8ED]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<(BorrowRecord & { book?: { title: string } })[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return;
      setUser(profile);

      // Fetch stats
      const { data: books } = await supabase
        .from('books')
        .select('id, available_copies, total_copies')
        .eq('school_id', profile.school_id)
        .eq('archived', false);

      const totalBooks = books?.reduce((sum: number, b: { total_copies: number }) => sum + b.total_copies, 0) || 0;
      const booksBorrowed = books?.reduce((sum: number, b: { total_copies: number; available_copies: number }) => sum + (b.total_copies - b.available_copies), 0) || 0;

      const { data: overdue } = await supabase
        .from('borrow_records')
        .select('fine_amount')
        .eq('school_id', profile.school_id)
        .eq('status', 'overdue');

      const overdueCount = overdue?.length || 0;
      const totalFines = overdue?.reduce((sum: number, r: { fine_amount: number }) => sum + Number(r.fine_amount), 0) || 0;

      setStats({
        total_books: totalBooks,
        books_borrowed: booksBorrowed,
        overdue_count: overdueCount,
        total_fines_outstanding: totalFines,
      });

      // Fetch recent activity
      const { data: recent } = await supabase
        .from('borrow_records')
        .select('*, book:books(title)')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (recent) setRecentActivity(recent as any);
    }

    load();
  }, [supabase]);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#E8E8ED]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B6B7B]">
            Welcome back, {user?.full_name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total Books"
            value={stats?.total_books ?? '-'}
            accent="bg-emerald-500/15 text-emerald-400"
          />
          <StatCard
            icon={ArrowUpFromLine}
            label="Currently Borrowed"
            value={stats?.books_borrowed ?? '-'}
            accent="bg-amber-500/15 text-amber-400"
          />
          <StatCard
            icon={Clock}
            label="Overdue Records"
            value={stats?.overdue_count ?? '-'}
            accent="bg-red-500/15 text-red-400"
          />
          <StatCard
            icon={Coins}
            label="Total Fines O/S"
            value={stats ? formatCurrency(stats.total_fines_outstanding) : '-'}
            accent="bg-blue-500/15 text-blue-400"
          />
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold text-[#E8E8ED] mb-4">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-[#1E1E28] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E1E28] bg-[#0F0F14]">
                    <th className="px-4 py-3 text-left font-medium text-[#6B6B7B]">Student</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6B6B7B]">Book</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6B6B7B]">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6B6B7B]">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[#6B6B7B]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4A4A55]">
                        No activity yet
                      </td>
                    </tr>
                  )}
                  {recentActivity.map((record) => (
                    <tr key={record.id} className="border-b border-[#1E1E28] last:border-0 hover:bg-[#0F0F14] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[#E8E8ED] font-medium">{record.student_name}</p>
                        <p className="text-xs text-[#6B6B7B]">{record.admission_number}</p>
                      </td>
                      <td className="px-4 py-3 text-[#E8E8ED]">
                        {(record as any).book?.title || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={record.actual_return_date ? 'text-emerald-400' : 'text-amber-400'}>
                          {record.actual_return_date ? 'Returned' : 'Borrowed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B6B7B]">
                        {formatDate(record.borrow_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          record.status === 'returned'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : record.status === 'overdue'
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
