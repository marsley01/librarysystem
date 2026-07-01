'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { generateQrValue } from '@/lib/utils';

interface CsvRow {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  subject?: string;
  department?: string;
  total_copies?: number;
  condition?: string;
  [key: string]: any;
}

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const rows: CsvRow[] = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: CsvRow = {} as CsvRow;
        headers.forEach((h, idx) => {
          (row as any)[h] = values[idx] || '';
        });
        rows.push(row);
      }
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const downloadTemplate = () => {
    const headers = [
      'title', 'author', 'isbn', 'publication_year', 'category', 'subject',
      'department', 'total_copies', 'shelf_number', 'rack_number', 'condition',
      'supplier', 'acquisition_date', 'purchase_cost',
    ];
    const sampleRow = [
      'The River Between', 'Ngugi wa Thiong\'o', '9789966463685', '1965', 'Fiction',
      'English', 'Languages', '5', 'A1', 'R2', 'good', 'Textbook Centre', '2024-01-15', '850.00',
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kls-book-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from('users')
      .select('school_id')
      .eq('id', authUser.id)
      .single();

    if (!profile) return;

    setUploading(true);
    const errors: string[] = [];
    let success = 0;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        setUploading(false);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const batchSize = 50;

      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        const booksToInsert: any[] = [];

        for (const line of batch) {
          const values = line.split(',').map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          if (!row.title || !row.author) {
            errors.push(`Row ${i + batch.indexOf(line) + 1}: missing title or author`);
            continue;
          }

          const totalCopies = parseInt(row.total_copies) || 1;

          booksToInsert.push({
            school_id: profile.school_id,
            title: row.title,
            author: row.author,
            isbn: row.isbn || null,
            publication_year: row.publication_year ? parseInt(row.publication_year) : null,
            category: row.category || null,
            subject: row.subject || null,
            department: row.department || null,
            total_copies: totalCopies,
            available_copies: totalCopies,
            shelf_number: row.shelf_number || null,
            rack_number: row.rack_number || null,
            condition: row.condition || null,
            supplier: row.supplier || null,
            acquisition_date: row.acquisition_date || null,
            purchase_cost: row.purchase_cost ? parseFloat(row.purchase_cost) : null,
            qr_code_value: generateQrValue(),
          });
        }

        if (booksToInsert.length > 0) {
          const { error } = await supabase.from('books').insert(booksToInsert);
          if (error) {
            errors.push(`Batch error: ${error.message}`);
          } else {
            success += booksToInsert.length;
          }
        }
      }

      setResults({ success, errors: errors.slice(0, 10) });
      setUploading(false);
      setFile(null);
      setPreview([]);
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#E8E8ED]">Bulk CSV Upload</h1>
            <p className="text-sm text-[#6B6B7B]">Import multiple books at once using a CSV file</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">CSV Template</h2>
              <p className="text-sm text-[#6B6B7B] mt-1">Download our template to ensure correct formatting</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-t border-[#1E1E28]" />

          <div>
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#2A2A35] bg-transparent p-8 cursor-pointer hover:border-[#C5A55A]/50 transition-colors">
              <Upload className="h-8 w-8 text-[#6B6B7B] mb-3" />
              <p className="text-sm text-[#9D9DA8]">
                {file ? file.name : 'Click to select CSV file'}
              </p>
              <p className="text-xs text-[#4A4A55] mt-1">.csv files only</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#E8E8ED] mb-2">Preview ({preview.length} rows)</h3>
              <div className="rounded-lg border border-[#1E1E28] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0B0B0F]">
                      {Object.keys(preview[0]).map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left text-[#6B6B7B] font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t border-[#1E1E28]">
                        {Object.values(row).map((val, jdx) => (
                          <td key={jdx} className="px-2 py-1.5 text-[#9D9DA8]">{String(val).substring(0, 30)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {file && !results && (
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? 'Uploading...' : `Upload ${file.name}`}
            </Button>
          )}

          {results && (
            <div className="space-y-3">
              <div className={`rounded-lg border p-4 flex items-start gap-3 ${results.errors.length === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                {results.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-[#E8E8ED]">
                    {results.success} book{results.success !== 1 ? 's' : ''} imported successfully
                  </p>
                  {results.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {results.errors.map((err, idx) => (
                        <p key={idx} className="text-xs text-red-400">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Link href="/books">
                <Button variant="outline" className="w-full">View Books</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
