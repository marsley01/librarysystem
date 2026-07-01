'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import type { DemoRequest } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Mail, Phone, Users, MessageSquare } from 'lucide-react';

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [selected, setSelected] = useState<DemoRequest | null>(null);
  const [supabase] = useState(createClient);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    }
    load();
  }, [supabase]);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Quote Requests</h1>
          <p className="mt-1 text-sm text-muted-fg">Demo requests submitted from the landing page</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border divide-y divide-border max-h-[600px] overflow-y-auto">
            {requests.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left px-5 py-4 transition-colors hover:bg-surface ${
                  selected?.id === r.id ? 'bg-surface' : ''
                }`}
              >
                <p className="text-sm font-medium text-foreground">{r.school_name}</p>
                <p className="text-xs text-muted-fg mt-0.5">{r.contact_name} &middot; {r.email}</p>
                <p className="text-xs text-dimmed mt-1">{formatDate(r.created_at)}</p>
              </button>
            ))}
            {requests.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-dimmed">No quote requests yet</p>
            )}
          </div>

          <div className="rounded-xl border border-border p-5">
            {selected ? (
              <div className="space-y-4">
                <h2 className="font-heading text-base font-semibold text-foreground">{selected.school_name}</h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Users className="h-4 w-4 text-muted-fg" />
                    </div>
                    <div>
                      <p className="text-muted-fg text-xs">Contact</p>
                      <p className="text-foreground font-medium">{selected.contact_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-fg" />
                    </div>
                    <div>
                      <p className="text-muted-fg text-xs">Email</p>
                      <a href={`mailto:${selected.email}`} className="text-accent hover:underline font-medium">{selected.email}</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-fg" />
                    </div>
                    <div>
                      <p className="text-muted-fg text-xs">Phone</p>
                      <p className="text-foreground font-medium">{selected.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <MessageSquare className="h-4 w-4 text-muted-fg" />
                    </div>
                    <div>
                      <p className="text-muted-fg text-xs">Students</p>
                      <p className="text-foreground font-medium">{selected.student_count}</p>
                    </div>
                  </div>
                </div>

                {selected.message && (
                  <div>
                    <p className="text-xs text-muted-fg mb-1">Message</p>
                    <p className="text-sm text-foreground bg-muted rounded-lg p-3">{selected.message}</p>
                  </div>
                )}

                <p className="text-xs text-dimmed">Received {formatDate(selected.created_at)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-8 w-8 text-dimmed mb-2" />
                <p className="text-sm text-dimmed">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
