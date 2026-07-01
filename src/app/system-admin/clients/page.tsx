'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface School {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function SystemAdminClients() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSchools(data);
    setLoading(false);
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const supabase = createClient();
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    
    const { error } = await supabase
      .from('schools')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setSchools((prev) => 
        prev.map((s) => s.id === id ? { ...s, status: newStatus } : s)
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Client Institutions</h1>
        <p className="mt-1 text-sm text-muted-fg">Manage platform clients and their access</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-fg">Institution Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-fg">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-muted-fg">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-fg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-dimmed">
                    Loading clients...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-dimmed">
                    No clients registered yet
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">{school.name}</td>
                    <td className="px-4 py-4 text-muted-fg">{formatDate(school.created_at)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={school.status === 'active' ? 'good' : 'damaged'}>
                        {school.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {school.status === 'active' ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleToggleStatus(school.id, school.status)}
                        >
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Ban Client
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleToggleStatus(school.id, school.status)}
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Unban Client
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
