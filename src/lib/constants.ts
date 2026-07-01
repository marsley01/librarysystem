export const APP_NAME = 'KenyaLibrarySystems';
export const APP_SHORT_NAME = 'KLS';

export const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Textbook',
  'Reference',
  'Biography',
  'Science',
  'Mathematics',
  'History',
  'Geography',
  'Literature',
  'Religious Studies',
  'Kiswahili',
  'English',
  'Computer Science',
  'Agriculture',
  'Business Studies',
  'Art & Design',
  'Music',
  'Physical Education',
  'Life Skills',
] as const;

export const BOOK_SUBJECTS = [
  'Mathematics',
  'English',
  'Kiswahili',
  'Biology',
  'Chemistry',
  'Physics',
  'History & Government',
  'Geography',
  'CRE',
  'IRE',
  'HRE',
  'Agriculture',
  'Business Studies',
  'Computer Studies',
  'Home Science',
  'Art & Design',
  'Music',
  'Physical Education',
  'Life Skills Education',
] as const;

export const BOOK_DEPARTMENTS = [
  'Languages',
  'Mathematics',
  'Sciences',
  'Humanities',
  'Technical & Creative',
  'General',
] as const;

export const BOOK_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
] as const;

export const BORROW_STATUS_COLORS: Record<string, string> = {
  borrowed: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  returned: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Books', href: '/books', icon: 'BookOpen' },
  { label: 'Issue Book', href: '/borrow/issue', icon: 'ArrowUpFromLine' },
  { label: 'Return Book', href: '/borrow/return', icon: 'ArrowDownToLine' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Books', href: '/books', icon: 'BookOpen' },
  { label: 'Issue Book', href: '/borrow/issue', icon: 'ArrowUpFromLine' },
  { label: 'Return Book', href: '/borrow/return', icon: 'ArrowDownToLine' },
  { label: 'Librarians', href: '/admin/librarians', icon: 'Users' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
  { label: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
];
