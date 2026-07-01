# KenyaLibrarySystems (KLS)

School library management system for Kenyan schools. Phase 1 includes book inventory management, QR-code-based borrow/return, and role-based access for librarians and school admins.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** TailwindCSS v4 + Shadcn UI
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth (email/password)
- **QR:** `qrcode.react` (generation), `html5-qrcode` (scanning)
- **Deploy:** Vercel-ready

## Setup

### 1. Supabase Project

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema migration:
   - Open `supabase/migrations/001_schema.sql`
   - Copy and paste into SQL Editor, then run
3. Enable email/password auth in **Authentication > Providers > Email**

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (found in **Settings > API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Seed Data

**Option A: SQL Seed**
Run `supabase/migrations/002_seed.sql` in the Supabase SQL Editor to create the school and sample books.

**Option B: Script**
```bash
# Set service role key (from Supabase Settings > API)
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

npx tsx scripts/seed.ts
```

### 5. Create Your Admin User

1. Go to **Authentication > Users** in Supabase dashboard
2. Click **Add User** and create an account (email + password)
3. Copy the new user's UUID
4. Run this SQL in the SQL Editor:
   ```sql
   INSERT INTO users (id, school_id, role, full_name, email)
   VALUES ('<USER_UUID>', '00000000-0000-0000-0000-000000000001', 'admin', 'Your Name', 'your@email.com');
   ```
5. Log in at [http://localhost:3000/login](http://localhost:3000/login)

## Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── dashboard/          # Librarian & Admin dashboard
│   ├── books/              # Book inventory (list, new, edit, labels, CSV upload)
│   ├── borrow/
│   │   ├── issue/          # Issue book (QR scan + form)
│   │   └── return/         # Return book (QR scan + fine calc)
│   ├── admin/
│   │   ├── librarians/     # Manage librarian accounts (admin only)
│   │   ├── settings/       # School settings (fine rate, loan period)
│   │   └── reports/        # Reports & CSV export
│   ├── auth/callback/      # Auth callback handler
│   └── api/                # API routes (profile, CSV template, reports)
├── components/
│   ├── ui/                 # Shadcn-style UI components
│   ├── layout/             # Sidebar, AppShell
│   └── qr/                 # QR scanner component
├── lib/
│   ├── supabase/           # Client, server, middleware helpers
│   ├── utils.ts            # Formatting, QR generation
│   └── constants.ts        # Categories, subjects, nav items
└── types/
    └── database.ts         # TypeScript types
```

## Key Design Decisions

- **QR-only (no barcode):** QR codes store the full book ID and can be scanned via any phone camera or webcam. No special hardware needed.
- **School_id on every table:** Multi-tenant ready from day one. All RLS policies filter by school_id.
- **Overdue tracking:** Checked on page load (in borrow/return flows and dashboard) rather than using a cron job. Simpler to implement and maintain for Phase 1. A Supabase scheduled function can be added in a later phase.
- **Soft-delete (archive):** Books are archived rather than deleted. Schools need borrowing history.
- **Dark mode default:** Near-black (#0B0B0F) with gold (#C5A55A) accent — serious, institutional feel.

## Roles

| Feature | Librarian | Admin |
|---------|-----------|-------|
| Manage books | Yes | Yes |
| Issue/Return books | Yes | Yes |
| Dashboard | Yes | Yes |
| Invite librarians | No | Yes |
| Manage school settings | No | Yes |
| View reports | No | Yes |

## Future Phases (not implemented)

- Student portal / self-service
- Digital library / e-books
- AI librarian / recommendations
- Analytics dashboards with charts
- Multi-school billing
- Barcode hardware support
- SMS/email notifications for overdue books
