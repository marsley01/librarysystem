'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { BorrowRecord, Book, User } from '@/types/database';

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [monthlyBorrows, setMonthlyBorrows] = useState<number>(0);
  const [overdueList, setOverdueList] = useState<(BorrowRecord & { book?: Book })[]>([]);
  const [mostBorrowed, setMostBorrowed] = useState<{ title: string; count: number }[]>([]);
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
      const sid = profile.school_id;

      // Monthly borrows
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { count: monthlyCount } = await supabase
        .from('borrow_records')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', sid)
        .gte('created_at', startOfMonth.toISOString());
      setMonthlyBorrows(monthlyCount || 0);

      // Overdue list
      const { data: overdue } = await supabase
        .from('borrow_records')
        .select('*, book:books(*)')
        .eq('school_id', sid)
        .in('status', ['borrowed', 'overdue'])
        .lt('expected_return_date', new Date().toISOString().split('T')[0])
        .order('expected_return_date', { ascending: true });
      if (overdue) setOverdueList(overdue as any);

      // Most borrowed books
      const { data: records } = await supabase
        .from('borrow_records')
        .select('book_id')
        .eq('school_id', sid);

      if (records) {
        const counts: Record<string, number> = {};
        records.forEach((r: { book_id: string }) => {
          counts[r.book_id] = (counts[r.book_id] || 0) + 1;
        });

        const sorted = Object.entries(counts)
          .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
          .slice(0, 10);

        const mostBorrowedWithTitles: { title: string; count: number }[] = [];
        for (const [bookId, count] of sorted) {
          const { data: b } = await supabase
            .from('books')
            .select('title')
            .eq('id', bookId)
            .single();
          if (b) mostBorrowedWithTitles.push({ title: b.title, count });
        }
        setMostBorrowed(mostBorrowedWithTitles);
      }
    }
    load();
  }, [supabase]);

  const exportCsv = (type: string) => {
    let csv = '';
    if (type === 'overdue') {
      csv = 'Student,Admission,Class,Book,Expected Return,Days Overdue\n';
      overdueList.forEach((r) => {
        const daysOverdue = Math.ceil(
          (new Date().getTime() - new Date(r.expected_return_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        csv += `${r.student_name},${r.admission_number},${r.student_class},"${(r as any).book?.title || ''}",${r.expected_return_date},${daysOverdue}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kls-${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#E8E8ED]">Reports</h1>
            <p className="mt-1 text-sm text-[#6B6B7B]">Library usage data and insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-5">
            <p className="text-sm text-[#6B6B7B]">Books Borrowed This Month</p>
            <p className="font-heading text-3xl font-bold text-[#E8E8ED] mt-1">{monthlyBorrows}</p>
          </div>
          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-5">
            <p className="text-sm text-[#6B6B7B]">Overdue Items</p>
            <p className="font-heading text-3xl font-bold text-red-400 mt-1">{overdueList.length}</p>
          </div>
          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-5">
            <p className="text-sm text-[#6B6B7B]">Total Fines Outstanding</p>
            <p className="font-heading text-3xl font-bold text-amber-400 mt-1">
              {formatCurrency(overdueList.reduce((s, r) => s + Number(r.fine_amount), 0))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue List */}
          <div className="rounded-xl border border-[#1E1E28]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E28]">
              <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Overdue Records</h2>
              <Button variant="ghost" size="sm" onClick={() => exportCsv('overdue')}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F0F14]">
                    <th className="px-4 py-2.5 text-left font-medium text-[#6B6B7B]">Student</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[#6B6B7B]">Book</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[#6B6B7B]">Due</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[#6B6B7B]">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueList.slice(0, 20).map((r) => {
                    const days = Math.ceil(
                      (new Date().getTime() - new Date(r.expected_return_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={r.id} className="border-t border-[#1E1E28] hover:bg-[#0F0F14]">
                        <td className="px-4 py-2.5 text-[#E8E8ED]">{r.student_name}</td>
                        <td className="px-4 py-2.5 text-[#9D9DA8]">{(r as any).book?.title?.substring(0, 30) || 'Unknown'}</td>
                        <td className="px-4 py-2.5 text-[#6B6B7B]">{formatDate(r.expected_return_date)}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="overdue">{days}d</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {overdueList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#4A4A55]">
                        No overdue records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Borrowed Books */}
          <div className="rounded-xl border border-[#1E1E28]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E28]">
              <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Most Borrowed Books</h2>
              <BarChart3 className="h-4 w-4 text-[#6B6B7B]" />
            </div>
            <div className="p-5">
              {mostBorrowed.length === 0 && (
                <p className="text-sm text-[#4A4A55] text-center py-8">No data yet</p>
              )}
              <div className="space-y-3">
                {mostBorrowed.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E1E28] text-xs font-medium text-[#6B6B7B]">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E8ED] truncate">{item.title}</p>
                    </div>
                    <span className="text-sm font-medium text-[#C5A55A]">{item.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
