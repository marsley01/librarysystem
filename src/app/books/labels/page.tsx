'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import type { Book, User } from '@/types/database';
import { APP_SHORT_NAME } from '@/lib/constants';

export default function LabelsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

      if (profile) {
        setUser(profile);
        const { data: booksData } = await supabase
          .from('books')
          .select('*')
          .eq('school_id', profile.school_id)
          .eq('archived', false)
          .order('title');

        if (booksData) setBooks(booksData);
      }
    }
    load();
  }, [supabase]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === books.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(books.map((b) => b.id)));
    }
  };

  const printLabels = () => {
    window.print();
  };

  const selectedBooks = books.filter((b) => selectedIds.has(b.id));

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              QR Code Labels
            </h1>
            <p className="mt-1 text-sm text-muted-fg">
              Select books to print QR code labels for spine or cover placement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={selectAll}>
              {selectedIds.size === books.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button onClick={printLabels} disabled={selectedIds.size === 0}>
              <Printer className="h-4 w-4 mr-2" />
              Print ({selectedIds.size})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 no-print">
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => toggleSelect(book.id)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selectedIds.has(book.id)
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <QRCodeSVG value={book.qr_code_value} size={48} fgColor="#C5A55A" bgColor="transparent" />
              </div>
              <p className="text-xs font-medium text-foreground truncate">{book.title}</p>
              <p className="text-xs text-muted-fg truncate">{book.author}</p>
            </button>
          ))}
          {books.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-dimmed">
              No books available. Add books first to print labels.
            </div>
          )}
        </div>

        {/* Print Area */}
        {selectedBooks.length > 0 && (
          <div className="print-area hidden print:block">
            <div className="grid grid-cols-4 gap-4 p-4">
              {selectedBooks.map((book) => (
                <div
                  key={book.id}
                  className="border border-gray-300 rounded p-3 text-center"
                  style={{ width: '2.5in', height: '1.5in' }}
                >
                  <QRCodeSVG value={book.qr_code_value} size={64} fgColor="#000000" bgColor="#ffffff" />
                  <p className="text-[8px] font-bold mt-1 truncate">{book.title}</p>
                  <p className="text-[7px] text-gray-500">{book.qr_code_value}</p>
                  <p className="text-[7px] text-gray-500">{APP_SHORT_NAME}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
