'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrScanner } from '@/components/qr/scanner';
import { Search, Camera, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency, daysBetween } from '@/lib/utils';
import type { Book, BorrowRecord, User } from '@/types/database';

export default function ReturnBookPage() {
  const [step, setStep] = useState<'scan' | 'confirm'>('scan');
  const [borrowRecord, setBorrowRecord] = useState<(BorrowRecord & { book?: Book }) | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<(BorrowRecord & { book?: Book })[]>([]);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineRate, setFineRate] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
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

      if (profile) {
        setUser(profile);
        // Get fine rate from school settings
        const { data: settings } = await supabase
          .from('school_settings')
          .select('fine_per_day')
          .eq('school_id', profile.school_id)
          .single();

        if (settings) setFineRate(Number(settings.fine_per_day));
      }
    }
    load();
  }, [supabase]);

  const handleQrScan = async (value: string) => {
    if (!user) return;

    // Find active borrow record by book QR code
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('qr_code_value', value)
      .eq('school_id', user.school_id)
      .single();

    if (!book) {
      setError('Book not found');
      return;
    }

    const { data: records } = await supabase
      .from('borrow_records')
      .select('*, book:books(*)')
      .eq('book_id', book.id)
      .eq('school_id', user.school_id)
      .in('status', ['borrowed', 'overdue'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (!records || records.length === 0) {
      setError('No active borrow record found for this book');
      return;
    }

    selectRecord(records[0] as any);
  };

  const handleManualSearch = async () => {
    if (!user || !searchInput.trim()) return;

    const { data } = await supabase
      .from('borrow_records')
      .select('*, book:books(*)')
      .eq('school_id', user.school_id)
      .in('status', ['borrowed', 'overdue'])
      .or(
        `student_name.ilike.%${searchInput}%,admission_number.ilike.%${searchInput}%,student_class.ilike.%${searchInput}%`
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setSearchResults(data as any);
  };

  const selectRecord = (record: BorrowRecord & { book?: Book }) => {
    setBorrowRecord(record);
    setStep('confirm');
    setError(null);

    // Calculate fine if overdue
    if (record.status === 'overdue' || new Date(record.expected_return_date) < new Date()) {
      const daysLate = daysBetween(new Date(record.expected_return_date), new Date());
      if (daysLate > 0) {
        setFineAmount(daysLate * fineRate);
      } else {
        setFineAmount(0);
      }
    } else {
      setFineAmount(0);
    }
  };

  const handleReturn = async () => {
    if (!user || !borrowRecord || !borrowRecord.book) return;

    setSubmitting(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('borrow_records')
      .update({
        actual_return_date: today,
        status: 'returned',
        fine_amount: fineAmount,
      })
      .eq('id', borrowRecord.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    // Increment available copies
    await supabase
      .from('books')
      .update({ available_copies: borrowRecord.book.available_copies + 1 })
      .eq('id', borrowRecord.book.id);

    setSuccess(true);
    setSubmitting(false);
  };

  const resetForm = () => {
    setStep('scan');
    setBorrowRecord(null);
    setSearchResults([]);
    setSearchInput('');
    setError(null);
    setSuccess(false);
    setFineAmount(0);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Return Book</h1>
          <p className="mt-1 text-sm text-muted-fg">Scan QR code or search for an active borrow record</p>
        </div>

        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Book Returned Successfully</h2>
              <p className="mt-2 text-sm text-muted-fg">
                {borrowRecord?.book?.title} returned by {borrowRecord?.student_name}
              </p>
              {fineAmount > 0 && (
                <p className="text-sm text-amber-400 mt-1">
                  Fine collected: {formatCurrency(fineAmount)}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={resetForm}>Return Another Book</Button>
              <Link href="/dashboard"><Button variant="ghost">Back to Dashboard</Button></Link>
            </div>
          </div>
        ) : step === 'scan' ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-base font-semibold text-foreground">Scan QR Code</h2>
              </div>
              <QrScanner onScan={handleQrScan} onError={(msg) => setError(msg)} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-fg">or search by student details</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-base font-semibold text-foreground">Search Borrow Records</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by student name, admission number, or class..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Button onClick={handleManualSearch}><Search className="h-4 w-4" /></Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRecord(r)}
                      className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{r.student_name}</p>
                        <p className="text-xs text-muted-fg">
                          {r.book?.title} &middot; Due: {formatDate(r.expected_return_date)}
                        </p>
                      </div>
                      <Badge variant={r.status as any}>{r.status}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
          </div>
        ) : (
          /* Confirm Return */
          borrowRecord && borrowRecord.book && (
            <div className="space-y-6">
              <button onClick={() => { setStep('scan'); setBorrowRecord(null); setError(null); }} className="flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to search
              </button>

              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h2 className="font-heading text-lg font-semibold text-foreground">{borrowRecord.book.title}</h2>
                    <p className="text-sm text-muted-fg">{borrowRecord.book.author}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                <h2 className="font-heading text-base font-semibold text-foreground">Borrow Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-fg">Student</p>
                    <p className="text-foreground font-medium">{borrowRecord.student_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-fg">Admission No.</p>
                    <p className="text-foreground font-medium">{borrowRecord.admission_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-fg">Class</p>
                    <p className="text-foreground font-medium">{borrowRecord.student_class}</p>
                  </div>
                  <div>
                    <p className="text-muted-fg">Status</p>
                    <Badge variant={borrowRecord.status as any}>{borrowRecord.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-fg">Borrowed</p>
                    <p className="text-foreground font-medium">{formatDate(borrowRecord.borrow_date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-fg">Expected Return</p>
                    <p className="text-foreground font-medium">{formatDate(borrowRecord.expected_return_date)}</p>
                  </div>
                </div>

                {fineAmount > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm font-medium text-amber-400">Late Return Fine</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(fineAmount)}</p>
                    <p className="text-xs text-amber-400/70 mt-1">
                      {daysBetween(new Date(borrowRecord.expected_return_date), new Date())} days late at {formatCurrency(fineRate)}/day
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <Button onClick={handleReturn} disabled={submitting} className="w-full">
                {submitting ? 'Processing...' : fineAmount > 0 ? `Collect ${formatCurrency(fineAmount)} & Return` : 'Confirm Return'}
              </Button>
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
