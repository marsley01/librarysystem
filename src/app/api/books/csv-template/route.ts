import { NextResponse } from 'next/server';

export async function GET() {
  const headers = [
    'title', 'author', 'isbn', 'publication_year', 'category', 'subject',
    'department', 'total_copies', 'shelf_number', 'rack_number', 'condition',
    'supplier', 'acquisition_date', 'purchase_cost',
  ];

  const csv = headers.join(',') + '\n';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="kls-book-import-template.csv"',
    },
  });
}
