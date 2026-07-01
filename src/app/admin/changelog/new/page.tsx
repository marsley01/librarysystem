'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CHANGELOG_TYPES, CHANGELOG_STATUSES, CHANGELOG_SEVERITIES } from '@/lib/constants';

export default function NewChangelogPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [severity, setSeverity] = useState('medium');
  const [status, setStatus] = useState('open');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) { setError('Supabase not configured.'); return; }

    setLoading(true);

    const { error: insertError } = await supabase.from('changelog').insert({
      title,
      description,
      type,
      severity: type === 'issue' ? severity : null,
      status,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/admin/changelog');
    router.refresh();
  };

  return (
    <AppShell>
      <div className="max-w-2xl animate-fade-in">
        <Link href="/admin/changelog" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Changelog
        </Link>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">New Changelog Entry</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the change" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what changed, why, and any action needed"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:ring-2 focus:ring-accent min-h-[120px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                {CHANGELOG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {type === 'issue' && (
              <div className="space-y-2">
                <Label>Severity</Label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  {CHANGELOG_SEVERITIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                {CHANGELOG_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Entry'}
            </Button>
            <Link href="/admin/changelog">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
