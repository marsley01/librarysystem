'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Building2, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState({
    schools: 0,
    quotes: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      
      const [schoolsRes, quotesRes, usersRes] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('demo_requests').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        schools: schoolsRes.count || 0,
        quotes: quotesRes.count || 0,
        users: usersRes.count || 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">System Overview</h1>
        <p className="mt-1 text-sm text-muted-fg">Platform-wide statistics and management</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/system-admin/clients" className="rounded-xl border border-border bg-surface p-6 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-fg">Total Institutions</p>
                <p className="font-heading text-3xl font-bold text-foreground mt-2">{stats.schools}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </Link>

          <Link href="/system-admin/quotes" className="rounded-xl border border-border bg-surface p-6 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-fg">Quote Requests</p>
                <p className="font-heading text-3xl font-bold text-foreground mt-2">{stats.quotes}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </Link>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-fg">Total Users</p>
                <p className="font-heading text-3xl font-bold text-foreground mt-2">{stats.users}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
