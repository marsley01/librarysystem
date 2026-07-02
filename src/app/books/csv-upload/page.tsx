'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setError(null);
    setResults(null);

    if (!f.name.endsWith('.csv')) {
      setError('Only .csv files are accepted');
      e.target.value = '';
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`);
      e.target.value = '';
      return;
    }

    setFile(f);

    const chunk = f.slice(0, 50 * 1024);
    const text = await chunk.text();
    const lines = text.split('\n').filter((l) => l.trim());

    if (lines.length > 0) {
      setPreviewHeaders(lines[0].split(',').map((h) => h.trim()));
      setPreviewRows(
        lines.slice(1, 6).map((l) => l.split(',').map((v) => v.trim()))
      );
    }
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

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/books/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      setProgress(100);
      setResults({ success: data.success, errors: data.errors || [] });
    } catch (err: any) {
      setError(err?.message || 'Network error. Check your connection and try again.');
    } finally {
      setUploading(false);
      setFile(null);
      setPreviewHeaders([]);
      setPreviewRows([]);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Bulk CSV Upload</h1>
            <p className="text-sm text-muted-fg">Import multiple books at once using a CSV file</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">CSV Template</h2>
              <p className="text-sm text-muted-fg mt-1">Download our template to ensure correct formatting</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-t border-border" />

          <div>
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-strong bg-transparent p-8 cursor-pointer hover:border-accent/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-fg mb-3" />
              <p className="text-sm text-secondary">
                {file ? file.name : 'Click to select CSV file'}
              </p>
              <p className="text-xs text-dimmed mt-1">.csv files only (max 10MB)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {previewHeaders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Preview (first rows)</h3>
              <div className="rounded-lg border border-border overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-background sticky top-0">
                      {previewHeaders.map((h, idx) => (
                        <th key={idx} className="px-2 py-1.5 text-left text-muted-fg font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        {row.map((val, jdx) => (
                          <td key={jdx} className="px-2 py-1.5 text-secondary whitespace-nowrap">{val?.substring(0, 30) || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-fg">Uploading & processing...</span>
                <span className="text-muted-fg">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {file && !uploading && !results && (
            <Button onClick={handleUpload} className="w-full">
              Upload {file.name}
            </Button>
          )}

          {results && (
            <div className="space-y-3 animate-fade-in">
              <div className={`rounded-lg border p-4 flex items-start gap-3 ${results.errors.length === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                {results.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {results.success} book{results.success !== 1 ? 's' : ''} imported successfully
                  </p>
                  {results.errors.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
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
