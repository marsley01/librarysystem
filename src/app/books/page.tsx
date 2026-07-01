'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Upload,
  FileDown,
  Archive,
  Edit,
  QrCode,
} from 'lucide-react';
import type { Book, User } from '@/types/database';
import { BOOK_CATEGORIES, BOOK_SUBJECTS, BOOK_DEPARTMENTS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
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

  useEffect(() => {
    async function fetchBooks() {
      if (!user) return;

      let query = supabase
        .from('books')
        .select('*')
        .eq('school_id', user.school_id);

      if (!showArchived) {
        query = query.eq('archived', false);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }
      if (departmentFilter !== 'all') {
        query = query.eq('department', departmentFilter);
      }
      if (availabilityFilter === 'available') {
        query = query.gt('available_copies', 0);
      } else if (availabilityFilter === 'unavailable') {
        query = query.eq('available_copies', 0);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%,qr_code_value.ilike.%${search}%`
        );
      }

      query = query.order('created_at', { ascending: false });

      const { data } = await query;
      if (data) setBooks(data);
    }

    fetchBooks();
  }, [user, search, categoryFilter, subjectFilter, departmentFilter, availabilityFilter, showArchived, supabase]);

  const handleArchive = async (bookId: string) => {
    await supabase
      .from('books')
      .update({ archived: true })
      .eq('id', bookId);

    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Books
            </h1>
            <p className="mt-1 text-sm text-muted-fg">
              {books.length} book{books.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/books/labels">
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Print Labels
              </Button>
            </Link>
            <Link href="/books/csv-upload">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                CSV Upload
              </Button>
            </Link>
            <Link href="/books/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <Input
              placeholder="Search by title, author, ISBN, or QR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {BOOK_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {BOOK_SUBJECTS.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {BOOK_DEPARTMENTS.map((dep) => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Borrowed Out</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showArchived ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archived
          </Button>
        </div>

        {/* Books Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-muted-fg w-8"></th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Author</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">ISBN</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Copies</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Condition</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">QR</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-fg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-dimmed">
                      No books found. Add your first book to get started.
                    </td>
                  </tr>
                )}
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className={`h-2 w-2 rounded-full ${
                        book.available_copies > 0 ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium">{book.title}</p>
                      {book.subject && (
                        <p className="text-xs text-muted-fg">{book.subject}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-secondary">{book.author}</td>
                    <td className="px-4 py-3 text-muted-fg font-mono text-xs">
                      {book.isbn || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {book.category && (
                        <span className="inline-flex items-center rounded-md border border-border-strong bg-muted px-2 py-0.5 text-xs text-secondary">
                          {book.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground font-medium">{book.available_copies}</span>
                      <span className="text-dimmed">/{book.total_copies}</span>
                    </td>
                    <td className="px-4 py-3">
                      {book.condition && (
                        <Badge variant={book.condition as any}>{book.condition}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(book.qr_code_value);
                        }}
                        className="text-xs"
                      >
                        {book.qr_code_value.substring(0, 8)}...
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/books/${book.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!book.archived && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(book.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
