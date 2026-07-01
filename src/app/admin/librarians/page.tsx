'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserX, Mail, Shield } from 'lucide-react';
import type { User } from '@/types/database';
import { formatDate } from '@/lib/utils';

export default function LibrariansPage() {
  const [librarians, setLibrarians] = useState<User[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('school_id', profile.school_id)
          .eq('role', 'librarian')
          .order('created_at', { ascending: false });
        if (data) setLibrarians(data);
      }
    }
    load();
  }, [supabase]);

  const handleInvite = async () => {
    if (!currentUser) return;
    setError(null);
    setInviting(true);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: inviteEmail,
      password: invitePassword,
    });

    if (authError || !authData.user) {
      setError(authError?.message || 'Failed to create account');
      setInviting(false);
      return;
    }

    // Create user record
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      school_id: currentUser.school_id,
      role: 'librarian',
      full_name: inviteName,
      email: inviteEmail,
    });

    if (userError) {
      setError(userError.message);
      setInviting(false);
      return;
    }

    setLibrarians((prev) => [
      {
        id: authData.user!.id,
        school_id: currentUser.school_id,
        role: 'librarian',
        full_name: inviteName,
        email: inviteEmail,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    setInviteEmail('');
    setInviteName('');
    setInvitePassword('');
    setShowInvite(false);
    setInviting(false);
  };

  const handleDeactivate = async (librarianId: string) => {
    await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', librarianId);

    setLibrarians((prev) =>
      prev.map((l) => (l.id === librarianId ? { ...l, is_active: false } : l))
    );
  };

  const handleReactivate = async (librarianId: string) => {
    await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', librarianId);

    setLibrarians((prev) =>
      prev.map((l) => (l.id === librarianId ? { ...l, is_active: true } : l))
    );
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Librarians</h1>
            <p className="mt-1 text-sm text-muted-fg">Manage librarian accounts</p>
          </div>
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Librarian
          </Button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-fg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {librarians.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-dimmed">
                      No librarians yet
                    </td>
                  </tr>
                )}
                {librarians.map((librarian) => (
                  <tr key={librarian.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-accent">
                          {librarian.full_name.charAt(0)}
                        </div>
                        <p className="text-foreground font-medium">{librarian.full_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{librarian.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={librarian.is_active ? 'good' : 'damaged'}>
                        {librarian.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-fg">{formatDate(librarian.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {librarian.is_active ? (
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivate(librarian.id)}>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleReactivate(librarian.id)}>
                          <Shield className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Dialog */}
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Librarian</DialogTitle>
              <DialogDescription>
                Create an account for a new librarian. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite_name">Full Name</Label>
                <Input id="invite_name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. John Kamau" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite_email">Email</Label>
                <Input id="invite_email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="librarian@school.ac.ke" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite_password">Temporary Password</Label>
                <Input id="invite_password" type="text" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} placeholder="Set a temporary password" />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
              )}

              <Button onClick={handleInvite} disabled={inviting} className="w-full">
                {inviting ? 'Creating...' : 'Create Librarian Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
