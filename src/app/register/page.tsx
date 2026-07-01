'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Library, AlertTriangle, CheckCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      school_id: '00000000-0000-0000-0000-000000000001',
      role: 'librarian',
      full_name: fullName,
      email,
    });

    if (insertError) {
      setError('Account created but profile setup failed. Contact admin.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Check Your Email</h1>
          <p className="mt-2 text-sm text-muted-fg">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
            Click the link to activate your account, then sign in.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-accent hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <Library className="h-7 w-7 text-background" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Register for {APP_NAME}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Kamau"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.ac.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
