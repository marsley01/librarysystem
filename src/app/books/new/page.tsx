'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { generateQrValue } from '@/lib/utils';
import { BOOK_CATEGORIES, BOOK_SUBJECTS, BOOK_DEPARTMENTS, BOOK_CONDITIONS } from '@/lib/constants';

const defaultForm = {
  title: '',
  author: '',
  isbn: '',
  publication_year: '',
  category: '',
  subject: '',
  department: '',
  total_copies: '1',
  shelf_number: '',
  rack_number: '',
  condition: '',
  supplier: '',
  acquisition_date: '',
  purchase_cost: '',
};

export default function NewBookPage() {
  const [form, setForm] = useState(defaultForm);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', authUser.id)
        .single();

      if (profile) setSchoolId(profile.school_id);
    }
    load();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    setError(null);
    setSaving(true);

    const qrCodeValue = generateQrValue();
    const totalCopies = parseInt(form.total_copies) || 1;

    const { error: insertError } = await supabase.from('books').insert({
      school_id: schoolId,
      title: form.title,
      author: form.author,
      isbn: form.isbn || null,
      publication_year: form.publication_year ? parseInt(form.publication_year) : null,
      category: form.category || null,
      subject: form.subject || null,
      department: form.department || null,
      total_copies: totalCopies,
      available_copies: totalCopies,
      shelf_number: form.shelf_number || null,
      rack_number: form.rack_number || null,
      condition: form.condition || null,
      supplier: form.supplier || null,
      acquisition_date: form.acquisition_date || null,
      purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : null,
      qr_code_value: qrCodeValue,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push('/books');
    router.refresh();
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#E8E8ED]">
              Add New Book
            </h1>
            <p className="text-sm text-[#6B6B7B]">
              A unique QR code will be auto-generated for this book
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-6 space-y-5">
            <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Book Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => updateField('isbn', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publication_year">Publication Year</Label>
                <Input
                  id="publication_year"
                  type="number"
                  value={form.publication_year}
                  onChange={(e) => updateField('publication_year', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_copies">Total Copies *</Label>
                <Input
                  id="total_copies"
                  type="number"
                  min="1"
                  value={form.total_copies}
                  onChange={(e) => updateField('total_copies', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-6 space-y-5">
            <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Classification</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={form.subject} onValueChange={(v) => updateField('subject', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_SUBJECTS.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => updateField('department', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_DEPARTMENTS.map((dep) => (
                      <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-6 space-y-5">
            <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Location & Condition</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shelf_number">Shelf Number</Label>
                <Input
                  id="shelf_number"
                  value={form.shelf_number}
                  onChange={(e) => updateField('shelf_number', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rack_number">Rack Number</Label>
                <Input
                  id="rack_number"
                  value={form.rack_number}
                  onChange={(e) => updateField('rack_number', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => updateField('condition', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={form.supplier}
                  onChange={(e) => updateField('supplier', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Acquisition Date</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={form.acquisition_date}
                  onChange={(e) => updateField('acquisition_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_cost">Purchase Cost (KES)</Label>
                <Input
                  id="purchase_cost"
                  type="number"
                  step="0.01"
                  value={form.purchase_cost}
                  onChange={(e) => updateField('purchase_cost', e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add Book'}
            </Button>
            <Link href="/books">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
