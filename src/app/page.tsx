'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Library,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  QrCode,
  BarChart3,
  Clock,
  ChevronDown,
  Send,
  Check,
} from 'lucide-react';

// ─── Theme ───────────────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kls-theme');
    const prefersDark = stored ? stored === 'dark' : true;
    setDark(prefersDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('kls-theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  return { dark, toggle: () => setDark((d) => !d), mounted };
}

// ─── Nav ─────────────────────────────────────────────────────────

function Nav({ dark, toggle, mounted }: { dark: boolean; toggle: () => void; mounted: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0A0A0F]/90 dark:bg-[#0A0A0F]/90 bg-[#F8F6F1]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A94A]">
            <Library className="h-4 w-4 text-[#0A0A0F]" />
          </div>
          <span className="font-heading text-sm font-bold tracking-tight text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
            KenyaLibrarySystems
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] hover:text-[#D4A94A] transition-colors">
              {l.label}
            </a>
          ))}
          {mounted && (
            <button onClick={toggle} className="p-1.5 rounded-md text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] hover:text-[#D4A94A] transition-colors" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <a href="#demo" className="rounded-lg bg-[#D4A94A] px-4 py-2 text-sm font-semibold text-[#0A0A0F] hover:bg-[#C49A3C] transition-colors">
            Book a Demo
          </a>
          <a href="/login" className="text-sm font-medium text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] hover:text-[#D4A94A] transition-colors">
            Sign In
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button onClick={toggle} className="p-1.5 rounded-md text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] hover:text-[#D4A94A]" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-md text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0A0A0F] dark:bg-[#0A0A0F] bg-[#F8F6F1] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-[#9D9DA8] dark:text-[#9D9DA8] text-[#5A5A6A] hover:text-[#D4A94A]">
                {l.label}
              </a>
            ))}
            <a href="#demo" onClick={() => setOpen(false)} className="rounded-lg bg-[#D4A94A] px-4 py-2 text-center text-sm font-semibold text-[#0A0A0F]">
              Book a Demo
            </a>
            <a href="/login" onClick={() => setOpen(false)} className="text-center text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
              Sign In
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────

function Section({ id, className = '', children, ...props }: { id?: string; className?: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <section id={id} className={`px-4 py-20 sm:px-6 sm:py-28 ${className}`} {...props}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionHeading({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-14 max-w-2xl">
      {label && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A94A]">
          {label}
        </p>
      )}
      <h2 className="font-heading text-3xl font-bold leading-tight text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── 1. HERO ─────────────────────────────────────────────────────

function Hero() {
  return (
    <Section className="pt-36 sm:pt-44">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A94A]">
            School Library Management
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] sm:text-5xl lg:text-6xl">
            Replace your manual library register with a system that actually tracks books.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] sm:text-lg">
            KenyaLibrarySystems lets you catalogue your entire book inventory, issue and return
            books using nothing but a phone camera, and automatically track who has what — all
            without special hardware or a dedicated IT team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-lg bg-[#D4A94A] px-6 py-3 text-sm font-semibold text-[#0A0A0F] hover:bg-[#C49A3C] transition-colors"
            >
              Book a Demo
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-transparent px-6 py-3 text-sm font-medium text-[#9D9DA8] dark:text-[#9D9DA8] text-[#5A5A6A] hover:border-[#D4A94A] hover:text-[#D4A94A] transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Dashboard mockup placeholder */}
        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] rounded-xl border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-[#2A2A35] dark:border-[#2A2A35] border-[#E0DDD6] px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#4A4A55]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#4A4A55]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#4A4A55]" />
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="h-3 w-24 rounded bg-[#2A2A35] dark:bg-[#2A2A35] bg-[#E8E8ED]" />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#E0DDD6] p-3">
                    <div className="h-2 w-16 rounded bg-[#2A2A35] dark:bg-[#2A2A35] bg-[#E0DDD6] mb-2" />
                    <div className="h-5 w-10 rounded bg-[#D4A94A]/30" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] p-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="h-3 flex-1 rounded bg-[#2A2A35] dark:bg-[#2A2A35] bg-[#E8E8ED]" />
                    <div className="h-3 w-20 rounded bg-[#2A2A35] dark:bg-[#2A2A35] bg-[#E8E8ED]" />
                    <div className="h-5 w-14 rounded bg-[#D4A94A]/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Subtle QR motif decoration */}
          <div className="absolute -right-4 -bottom-4 flex h-20 w-20 items-center justify-center rounded-lg border border-[#2A2A35]/50 dark:border-[#2A2A35]/50 border-[#D0CCC4]/50 bg-[#0F0F14]/80 dark:bg-[#0F0F14]/80 bg-[#FFFFFF]/80">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-[1px] ${[0, 1, 3, 4, 6, 8].includes(i) ? 'bg-[#D4A94A]' : i === 5 ? 'bg-[#D4A94A]/40' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── 2. THE PROBLEM ──────────────────────────────────────────────

const problems = [
  { stat: 'Unknown', label: 'books go missing each term with no way to trace them' },
  { stat: 'Days', label: 'spent on manual stock-taking every term instead of teaching' },
  { stat: 'Zero', label: 'visibility into which student has which book at any time' },
  { stat: 'Uncollected', label: 'late fines because there is no systematic tracking' },
];

function Problem() {
  return (
    <Section id="problem" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <SectionHeading
        title="What Manual Libraries Actually Cost You"
        subtitle="The operational drag of paper registers and spreadsheets adds up in ways you feel every term but rarely measure."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {problems.map((p, i) => (
          <div key={i} className="rounded-xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14]/50 dark:bg-[#0F0F14]/50 bg-[#FFFFFF]/50 p-6">
            <p className="font-heading text-3xl font-bold text-[#D4A94A]">{p.stat}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">{p.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── 3. HOW IT WORKS ─────────────────────────────────────────────

const steps = [
  {
    num: '01',
    title: 'Add your books & print QR labels',
    desc: 'Import your existing catalogue via CSV or add books one by one. Each book gets a unique QR code — print the labels and stick them on the spine or inside cover.',
    icon: BookOpen,
  },
  {
    num: '02',
    title: 'Scan to issue or return',
    desc: 'A librarian scans the book QR code with any phone camera or laptop webcam. Select the student, set the due date, and the system takes care of the rest.',
    icon: QrCode,
  },
  {
    num: '03',
    title: 'Track everything automatically',
    desc: 'Overdue books are flagged, fines are calculated, borrow history is recorded. The dashboard gives you a live picture of your entire library in under a minute.',
    icon: BarChart3,
  },
];

function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <SectionHeading
        label="How It Works"
        title="Three concrete steps."
        subtitle="No complicated setup. No training workshops. No external consultants."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="relative rounded-xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14]/50 dark:bg-[#0F0F14]/50 bg-[#FFFFFF]/50 p-6">
              <p className="font-heading text-5xl font-bold text-[#1E1E28] dark:text-[#1E1E28] text-[#E0DDD6]">{s.num}</p>
              <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A94A]/10">
                <Icon className="h-4 w-4 text-[#D4A94A]" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── 4. CORE CAPABILITIES ────────────────────────────────────────

const capabilities = [
  {
    title: 'Inventory management',
    desc: 'Catalogue thousands of books by title, author, subject, department, and shelf location. Bulk-import from a CSV. Archive without losing history.',
    icon: BookOpen,
  },
  {
    title: 'QR-based issue and return',
    desc: 'No barcode scanners, no RFID gates. A standard phone camera or laptop webcam is all you need. Issue and return a book in under ten seconds.',
    icon: QrCode,
  },
  {
    title: 'Automatic overdue tracking & fines',
    desc: 'The system flags overdue books and calculates fines at your configured daily rate. No more relying on memory or paper trails.',
    icon: Clock,
  },
  {
    title: 'Dashboard, reports & audit trail',
    desc: 'See current borrows, overdue counts, and total fines at a glance. Export CSV reports. Every action is logged with a timestamp and staff ID.',
    icon: BarChart3,
  },
];

function Capabilities() {
  return (
    <Section id="capabilities" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <SectionHeading
        label="Capabilities"
        title="What a librarian's day looks like."
        subtitle="Every feature is built around the actual workflow of a Kenyan school library — not abstract tech features."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {capabilities.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14]/50 dark:bg-[#0F0F14]/50 bg-[#FFFFFF]/50 p-6 transition-colors hover:border-[#D4A94A]/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A94A]/10">
                <Icon className="h-4 w-4 text-[#D4A94A]" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
                {c.desc}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── 5. BUILT FOR KENYAN SCHOOLS ────────────────────────────────

function BuiltForKenya() {
  return (
    <Section className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <div className="rounded-2xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] p-8 sm:p-12">
        <SectionHeading
          label="Built for Kenyan Schools"
          title="Built locally, for local needs."
          subtitle=""
        />
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
          <p>
            KenyaLibrarySystems was built because the available options either assumed reliable
            high-speed internet at every desk, required expensive hardware imports, or were not
            designed around the Kenyan school calendar, curriculum structure, and procurement cycle.
          </p>
          <p>
            This system works with intermittent connectivity (core functions cache locally), uses no
            special hardware beyond phones many schools already have, and prices itself for institutional
            budgets — per term or per year, not per-seat per-month SaaS models that don't match how
            schools plan their finances.
          </p>
          <p>
            Borrow records, student data, and book history stay within your school's Supabase
            database. Data export is available at any time. There is no vendor lock-in.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── 6. PRICING ──────────────────────────────────────────────────

function Pricing() {
  return (
    <Section id="pricing" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <SectionHeading
        label="Pricing"
        title="Simple, transparent, institutional."
        subtitle="Priced for school budgets — per-term or per-year billing. No per-student fees, no hidden overage charges."
      />
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14]/50 dark:bg-[#0F0F14]/50 bg-[#FFFFFF]/50 p-8 text-center">
          <p className="text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">Starting from</p>
          <p className="font-heading text-5xl font-bold text-[#D4A94A] mt-2">Request a Quote</p>
          <p className="mt-3 text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
            Pricing depends on school size and deployment scope. We'll tailor a plan that fits your
            budget and term cycle.
          </p>
          <div className="mt-6 border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] pt-6">
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">Billing</p>
                <p className="font-medium text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">Per term or per year</p>
              </div>
              <div>
                <p className="text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">Support</p>
                <p className="font-medium text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">Email & WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── 7. FAQ ──────────────────────────────────────────────────────

const faqs = [
  {
    q: 'Do we need special hardware?',
    a: 'No. The system uses QR codes scanned by any standard phone camera or laptop webcam. No barcode scanners, no RFID readers, no dedicated hardware of any kind.',
  },
  {
    q: 'What if our internet is unreliable?',
    a: 'The core issue/return flow requires a connection to the database, but the interface is lightweight and works over slow connections. For extended outages, we recommend maintaining a simple paper fallback log that can be entered into the system later. A full offline mode is planned for a future update.',
  },
  {
    q: 'Can we export our data if we switch systems?',
    a: 'Yes. All your data — books, borrow records, student history — can be exported as CSV at any time. There is no lock-in, and no exit fees.',
  },
  {
    q: 'How is our student data protected?',
    a: 'Student data is stored in your school\'s dedicated Supabase database. Access is controlled by user accounts with role-based permissions (librarian and admin). The system enforces Row Level Security — a librarian from one school cannot access another school\'s data even if they share the same Supabase instance.',
  },
  {
    q: 'How long does setup take?',
    a: 'A small school with a few hundred books can be set up in under an hour — create your account, import your book list via CSV, print QR labels, and you are ready to issue books. Larger deployments with thousands of books may take a day or two for labelling.',
  },
  {
    q: 'Is training provided?',
    a: 'Yes. The system is designed to be intuitive for anyone who has used a phone. We provide a brief walkthrough session (video call) for the librarian and admin staff as part of onboarding. No formal training workshops needed.',
  },
];

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <SectionHeading
        label="FAQ"
        title="Questions procurement asks."
        subtitle="Real answers to the concerns that come up before a school commits to a new system."
      />
      <div className="mx-auto max-w-3xl space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] bg-[#0F0F14]/50 dark:bg-[#0F0F14]/50 bg-[#FFFFFF]/50">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-medium text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
                {f.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#6B6B7B] transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4">
                <p className="text-sm leading-relaxed text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
                  {f.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── 8. FINAL CTA ────────────────────────────────────────────────

function FinalCta() {
  const [form, setForm] = useState({
    schoolName: '',
    contactName: '',
    email: '',
    phone: '',
    studentCount: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please email us directly.');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <Section id="demo" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="font-heading mt-5 text-2xl font-bold text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
            Thank you, {form.contactName.split(' ')[0]}
          </h2>
          <p className="mt-3 text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
            We have received your request for{' '}
            <span className="font-medium text-[#D4A94A]">{form.schoolName}</span>. A member of
            our team will reach out within 1&ndash;2 business days to schedule your demo.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="demo" className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6]">
      <div className="mx-auto max-w-xl">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A94A]">
            Book a Demo
          </p>
          <h2 className="font-heading mt-3 text-3xl font-bold text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] sm:text-4xl">
            See it in action.
          </h2>
          <p className="mt-3 text-sm text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A]">
            Fill in the form and we will walk you through the system on a video call. No
            commitment, no sales pitch — just a live demo over 20 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="schoolName" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                School Name *
              </label>
              <input
                id="schoolName"
                required
                value={form.schoolName}
                onChange={(e) => update('schoolName', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] placeholder-[#4A4A55] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
                placeholder="e.g. Nairobi School"
              />
            </div>
            <div>
              <label htmlFor="contactName" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                Your Name *
              </label>
              <input
                id="contactName"
                required
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] placeholder-[#4A4A55] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
                placeholder="e.g. John Kamau"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] placeholder-[#4A4A55] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
                placeholder="you@school.ac.ke"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] placeholder-[#4A4A55] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="studentCount" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                Approximate Students *
              </label>
              <select
                id="studentCount"
                required
                value={form.studentCount}
                onChange={(e) => update('studentCount', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
              >
                <option value="">Select range</option>
                <option value="<200">Less than 200</option>
                <option value="200-500">200 &ndash; 500</option>
                <option value="500-1000">500 &ndash; 1,000</option>
                <option value="1000-2000">1,000 &ndash; 2,000</option>
                <option value=">2000">More than 2,000</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B7B] dark:text-[#6B6B7B] text-[#5A5A6A] mb-1.5">
                Message (optional)
              </label>
              <input
                id="message"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A35] dark:border-[#2A2A35] border-[#D0CCC4] bg-[#0F0F14] dark:bg-[#0F0F14] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24] placeholder-[#4A4A55] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
                placeholder="Anything specific you want to see in the demo?"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A94A] px-6 py-3 text-sm font-semibold text-[#0A0A0F] hover:bg-[#C49A3C] disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Sending...' : (
              <>
                <Send className="h-4 w-4" />
                Book a Demo
              </>
            )}
          </button>
        </form>
      </div>
    </Section>
  );
}

// ─── 9. FOOTER ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#1E1E28] dark:border-[#1E1E28] border-[#E0DDD6] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#D4A94A]">
            <Library className="h-3.5 w-3.5 text-[#0A0A0F]" />
          </div>
          <span className="text-xs font-bold tracking-tight text-[#9D9DA8] dark:text-[#9D9DA8] text-[#5A5A6A]">
            KenyaLibrarySystems
          </span>
        </div>
        <p className="text-xs text-[#4A4A55] dark:text-[#4A4A55] text-[#9D9DA8]">
          School library management for Kenyan schools.
        </p>
        <p className="text-xs text-[#4A4A55] dark:text-[#4A4A55] text-[#9D9DA8]">
          hello@kenyalibrarysystems.com &middot; &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────

export default function LandingPage() {
  const { dark, toggle, mounted } = useTheme();

  return (
    <div className="min-h-screen bg-[#0A0A0F] dark:bg-[#0A0A0F] bg-[#F8F6F1] text-[#E8E8ED] dark:text-[#E8E8ED] text-[#1A1A24]">
      <Nav dark={dark} toggle={toggle} mounted={mounted} />
      <Hero />
      <Problem />
      <HowItWorks />
      <Capabilities />
      <BuiltForKenya />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
