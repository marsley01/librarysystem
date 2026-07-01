'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { BOOK_CATEGORIES, BOOK_SUBJECTS, BOOK_DEPARTMENTS, BOOK_CONDITIONS } from '@/lib/constants';
import type { Book } from '@/types/database';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [book, setBook] = useState<Book | null>(null);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setBook(data);
        setForm({
          title: data.title,
          author: data.author,
          isbn: data.isbn || '',
          publication_year: data.publication_year?.toString() || '',
          category: data.category || '',
          subject: data.subject || '',
          department: data.department || '',
          total_copies: data.total_copies.toString(),
          shelf_number: data.shelf_number || '',
          rack_number: data.rack_number || '',
          condition: data.condition || '',
          supplier: data.supplier || '',
          acquisition_date: data.acquisition_date || '',
          purchase_cost: data.purchase_cost?.toString() || '',
        });
      }
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const totalCopies = parseInt(form.total_copies) || 1;
    const currentAvailable = book?.available_copies || 0;
    const diff = totalCopies - (book?.total_copies || 0);
    const newAvailable = Math.max(0, currentAvailable + diff);

    const { error: updateError } = await supabase
      .from('books')
      .update({
        title: form.title,
        author: form.author,
        isbn: form.isbn || null,
        publication_year: form.publication_year ? parseInt(form.publication_year) : null,
        category: form.category || null,
        subject: form.subject || null,
        department: form.department || null,
        total_copies: totalCopies,
        available_copies: newAvailable,
        shelf_number: form.shelf_number || null,
        rack_number: form.rack_number || null,
        condition: form.condition || null,
        supplier: form.supplier || null,
        acquisition_date: form.acquisition_date || null,
        purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : null,
      })
      .eq('id', params.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/books');
    router.refresh();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!book) {
    return (
      <AppShell>
        <div className="text-center py-20 text-muted-fg">Book not found</div>
      </AppShell>
    );
  }

  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/books">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Edit Book
              </h1>
              <p className="text-sm text-muted-fg">{book.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <QRCodeSVG value={book.qr_code_value} size={48} fgColor="#C5A55A" bgColor="transparent" />
            <div className="text-xs text-muted-fg font-mono">
              {book.qr_code_value}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input id="author" value={form.author} onChange={(e) => updateField('author', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn} onChange={(e) => updateField('isbn', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publication_year">Publication Year</Label>
                <Input id="publication_year" type="number" value={form.publication_year} onChange={(e) => updateField('publication_year', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_copies">Total Copies *</Label>
                <Input id="total_copies" type="number" min="1" value={form.total_copies} onChange={(e) => updateField('total_copies', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={form.subject} onValueChange={(v) => updateField('subject', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BOOK_SUBJECTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => updateField('department', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BOOK_DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shelf_number">Shelf Number</Label>
                <Input id="shelf_number" value={form.shelf_number} onChange={(e) => updateField('shelf_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack_number">Rack Number</Label>
                <Input id="rack_number" value={form.rack_number} onChange={(e) => updateField('rack_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => updateField('condition', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BOOK_CONDITIONS.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={form.supplier} onChange={(e) => updateField('supplier', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Acquisition Date</Label>
                <Input id="acquisition_date" type="date" value={form.acquisition_date} onChange={(e) => updateField('acquisition_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_cost">Purchase Cost (KES)</Label>
                <Input id="purchase_cost" type="number" step="0.01" value={form.purchase_cost} onChange={(e) => updateField('purchase_cost', e.target.value)} />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href="/books"><Button type="button" variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
