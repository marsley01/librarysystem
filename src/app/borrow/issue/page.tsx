'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrScanner } from '@/components/qr/scanner';
import { Badge } from '@/components/ui/badge';
import { Search, Camera, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { Book, User } from '@/types/database';

export default function IssueBookPage() {
  const [step, setStep] = useState<'scan' | 'details' | 'confirm'>('scan');
  const [book, setBook] = useState<Book | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [studentName, setStudentName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [expectedDays, setExpectedDays] = useState('14');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
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

      if (profile) setUser(profile);
    }
    load();
  }, [supabase]);

  const handleQrScan = async (value: string) => {
    if (!user) return;
    setQrInput(value);

    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('qr_code_value', value)
      .eq('school_id', user.school_id)
      .eq('archived', false)
      .single();

    if (data) {
      if (data.available_copies <= 0) {
        setError('No available copies to borrow');
        return;
      }
      setBook(data);
      setStep('details');
      setError(null);
    } else {
      setError('Book not found or is archived');
    }
  };

  const handleManualSearch = async () => {
    if (!user || !searchInput.trim()) return;

    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('school_id', user.school_id)
      .eq('archived', false)
      .or(`title.ilike.%${searchInput}%,author.ilike.%${searchInput}%,isbn.ilike.%${searchInput}%,qr_code_value.ilike.%${searchInput}%`)
      .limit(10);

    if (data) setSearchResults(data);
  };

  const selectBook = (b: Book) => {
    if (b.available_copies <= 0) {
      setError('No available copies');
      return;
    }
    setBook(b);
    setStep('details');
    setError(null);
  };

  const calculateReturnDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(expectedDays));
    return date.toISOString().split('T')[0];
  };

  const handleIssue = async () => {
    if (!user || !book) return;

    if (!studentName || !admissionNumber || !studentClass) {
      setError('Please fill in all student details');
      return;
    }

    setSubmitting(true);
    setError(null);

    const returnDate = calculateReturnDate();

    const { error: borrowError } = await supabase.from('borrow_records').insert({
      school_id: user.school_id,
      book_id: book.id,
      student_name: studentName,
      admission_number: admissionNumber,
      student_class: studentClass,
      borrow_date: new Date().toISOString().split('T')[0],
      expected_return_date: returnDate,
      status: 'borrowed',
      issued_by: user.id,
    });

    if (borrowError) {
      setError(borrowError.message);
      setSubmitting(false);
      return;
    }

    // Decrement available copies
    await supabase
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', book.id);

    setStep('confirm');
    setSubmitting(false);
  };

  const resetForm = () => {
    setStep('scan');
    setBook(null);
    setQrInput('');
    setSearchInput('');
    setSearchResults([]);
    setStudentName('');
    setAdmissionNumber('');
    setStudentClass('');
    setExpectedDays('14');
    setError(null);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Issue Book</h1>
          <p className="mt-1 text-sm text-muted-fg">Scan QR code or search to find a book</p>
        </div>

        {/* Step 1: Scan / Search */}
        {step === 'scan' && (
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
                <span className="bg-background px-2 text-muted-fg">or search manually</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-base font-semibold text-foreground">Search Book</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by title, author, ISBN, or QR..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Button onClick={handleManualSearch}><Search className="h-4 w-4" /></Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => selectBook(b)}
                      className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{b.title}</p>
                        <p className="text-xs text-muted-fg">{b.author} &middot; {b.available_copies} available</p>
                      </div>
                      <Badge variant={b.available_copies > 0 ? 'new' : 'damaged'}>
                        {b.available_copies > 0 ? 'Available' : 'Out'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
          </div>
        )}

        {/* Step 2: Student Details */}
        {step === 'details' && book && (
          <div className="space-y-6">
            <button onClick={() => { setStep('scan'); setBook(null); setError(null); }} className="flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to search
            </button>

            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <QRCodeSVG value={book.qr_code_value} size={40} fgColor="#C5A55A" bgColor="transparent" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-lg font-semibold text-foreground">{book.title}</h2>
                  <p className="text-sm text-muted-fg">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={book.available_copies > 0 ? 'new' : 'damaged'}>
                      {book.available_copies} of {book.total_copies} available
                    </Badge>
                    {book.isbn && <span className="text-xs text-dimmed">ISBN: {book.isbn}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <h2 className="font-heading text-base font-semibold text-foreground">Student Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="student_name">Student Name *</Label>
                  <Input id="student_name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Jane Muthoni" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admission">Admission Number *</Label>
                  <Input id="admission" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} placeholder="e.g. 2024/5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Input id="class" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="e.g. Form 2A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_days">Loan Period (Days)</Label>
                  <Input id="loan_days" type="number" value={expectedDays} onChange={(e) => setExpectedDays(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Expected Return</Label>
                  <div className="flex h-10 items-center rounded-lg border border-border-strong bg-input px-3 text-sm text-foreground">
                    {calculateReturnDate()}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <Button onClick={handleIssue} disabled={submitting} className="w-full">
              {submitting ? 'Issuing...' : 'Issue Book'}
            </Button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && book && (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Book Issued Successfully</h2>
              <p className="mt-2 text-sm text-muted-fg">
                <span className="font-medium text-foreground">{book.title}</span> issued to{' '}
                <span className="font-medium text-foreground">{studentName}</span>
              </p>
              <p className="text-xs text-dimmed mt-1">
                Due back: {calculateReturnDate()}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={resetForm}>Issue Another Book</Button>
              <Link href="/dashboard"><Button variant="ghost">Back to Dashboard</Button></Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
