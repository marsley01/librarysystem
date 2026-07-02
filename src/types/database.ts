export type Role = 'librarian' | 'admin' | 'system_admin';

export type BookCondition = 'new' | 'good' | 'fair' | 'poor' | 'damaged';
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';

export interface School {
  id: string;
  name: string;
  fine_per_day: number;
  default_loan_days: number;
  created_at: string;
}

export interface User {
  id: string;
  school_id: string;
  role: Role;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Book {
  id: string;
  school_id: string;
  title: string;
  author: string;
  isbn: string | null;
  publication_year: number | null;
  category: string | null;
  subject: string | null;
  department: string | null;
  total_copies: number;
  available_copies: number;
  shelf_number: string | null;
  rack_number: string | null;
  condition: BookCondition | null;
  supplier: string | null;
  acquisition_date: string | null;
  purchase_cost: number | null;
  qr_code_value: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BorrowRecord {
  id: string;
  school_id: string;
  book_id: string;
  book?: Book;
  student_name: string;
  admission_number: string;
  student_class: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  status: BorrowStatus;
  fine_amount: number;
  issued_by: string;
  issuer?: User;
  created_at: string;
}

export interface SchoolSettings {
  id: string;
  school_id: string;
  fine_per_day: number;
  default_loan_days: number;
  updated_at: string;
  updated_by: string | null;
}

export interface DashboardStats {
  total_books: number;
  books_borrowed: number;
  overdue_count: number;
  total_fines_outstanding: number;
}

export interface DemoRequest {
  id: string;
  school_name: string;
  contact_name: string;
  email: string;
  phone: string;
  student_count: string;
  message: string | null;
  created_at: string;
}

export type ChangelogType = 'feature' | 'fix' | 'improvement' | 'issue' | 'announcement';
export type ChangelogStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ChangelogSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  type: ChangelogType;
  status: ChangelogStatus;
  severity: ChangelogSeverity | null;
  school_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CsvBookRow {
  title: string;
  author: string;
  isbn?: string;
  publication_year?: number;
  category?: string;
  subject?: string;
  department?: string;
  total_copies?: number;
  shelf_number?: string;
  rack_number?: string;
  condition?: BookCondition;
  supplier?: string;
  acquisition_date?: string;
  purchase_cost?: number;
}
