'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { ChangelogEntry } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { CHANGELOG_TYPES, CHANGELOG_STATUSES, CHANGELOG_SEVERITIES } from '@/lib/constants';

const typeColors: Record<string, string> = {
  feature: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  fix: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  improvement: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  issue: 'bg-red-500/15 text-red-400 border-red-500/30',
  announcement: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-500/15 text-red-400 border-red-500/30',
  in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  closed: 'bg-muted text-muted-fg border-border',
};

const severityColors: Record<string, string> = {
  low: 'bg-muted text-muted-fg border-border',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [supabase] = useState(createClient);

  useEffect(() => {
    async function load() {
      let query = supabase.from('changelog').select('*');

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query.order('created_at', { ascending: false });
      if (data) setEntries(data);
    }
    load();
  }, [supabase, filter]);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Changelog</h1>
            <p className="mt-1 text-sm text-muted-fg">Track issues, features, and system updates</p>
          </div>
          <Link href="/admin/changelog/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              New Entry
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-accent text-background'
                  : 'bg-muted text-muted-fg hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeColors[entry.type] || ''}`}>
                      {entry.type}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[entry.status] || ''}`}>
                      {entry.status.replace('_', ' ')}
                    </span>
                    {entry.severity && (
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${severityColors[entry.severity] || ''}`}>
                        {entry.severity}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground">{entry.title}</h3>
                  <p className="mt-1 text-sm text-muted-fg whitespace-pre-wrap">{entry.description}</p>
                </div>
                <p className="text-xs text-dimmed shrink-0">{formatDate(entry.created_at)}</p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-center text-sm text-dimmed py-12">No changelog entries found</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
