'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { ClipboardList, MessageSquare, Users as UsersIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { User, ChangelogEntry, DemoRequest } from '@/types/database';
import { formatDate } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, href, accent }: { icon: React.ElementType; label: string; value: number | string; href: string; accent: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong block">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-fg">{label}</p>
          <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [openIssues, setOpenIssues] = useState(0);
  const [demoRequests, setDemoRequests] = useState(0);
  const [recentChangelog, setRecentChangelog] = useState<ChangelogEntry[]>([]);
  const [recentDemos, setRecentDemos] = useState<DemoRequest[]>([]);
  const [librarianCount, setLibrarianCount] = useState(0);
  const [supabase] = useState(createClient);

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

      const { count: issues } = await supabase
        .from('changelog')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
      setOpenIssues(issues || 0);

      const { count: demos } = await supabase
        .from('demo_requests')
        .select('*', { count: 'exact', head: true });
      setDemoRequests(demos || 0);

      const { count: libs } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'librarian')
        .eq('school_id', profile.school_id)
        .eq('is_active', true);
      setLibrarianCount(libs || 0);

      const { data: changelog } = await supabase
        .from('changelog')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (changelog) setRecentChangelog(changelog);

      const { data: demosList } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (demosList) setRecentDemos(demosList);
    }
    load();
  }, [supabase]);

  const typeColors: Record<string, string> = {
    feature: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    fix: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    improvement: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    issue: 'bg-red-500/15 text-red-400 border-red-500/30',
    announcement: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Portal</h1>
          <p className="mt-1 text-sm text-muted-fg">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={AlertTriangle} label="Open Issues" value={openIssues} href="/admin/changelog" accent="bg-red-500/15 text-red-400" />
          <StatCard icon={MessageSquare} label="Quote Requests" value={demoRequests} href="/admin/demo-requests" accent="bg-amber-500/15 text-amber-400" />
          <StatCard icon={ClipboardList} label="Changelog Entries" value={recentChangelog.length} href="/admin/changelog" accent="bg-purple-500/15 text-purple-400" />
          <StatCard icon={UsersIcon} label="Active Librarians" value={librarianCount} href="/admin/librarians" accent="bg-blue-500/15 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Changelog */}
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading text-base font-semibold text-foreground">Recent Changelog</h2>
              <Link href="/admin/changelog" className="text-xs font-medium text-accent hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentChangelog.map((entry) => (
                <div key={entry.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeColors[entry.type] || ''}`}>
                      {entry.type}
                    </span>
                    <span className="text-xs text-muted-fg">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-fg mt-0.5 line-clamp-1">{entry.description}</p>
                </div>
              ))}
              {recentChangelog.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-dimmed">No changelog entries yet</p>
              )}
            </div>
          </div>

          {/* Recent Quote Requests */}
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading text-base font-semibold text-foreground">Recent Quote Requests</h2>
              <Link href="/admin/demo-requests" className="text-xs font-medium text-accent hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentDemos.map((d) => (
                <div key={d.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-foreground">{d.school_name}</p>
                  <p className="text-xs text-muted-fg">
                    {d.contact_name} &middot; {d.email}
                  </p>
                  <p className="text-xs text-dimmed mt-0.5">{formatDate(d.created_at)}</p>
                </div>
              ))}
              {recentDemos.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-dimmed">No quote requests yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
