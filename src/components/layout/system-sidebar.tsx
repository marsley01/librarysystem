'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_SHORT_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';

interface SystemSidebarProps {
  user: User;
}

const navItems = [
  { label: 'Overview', href: '/system-admin/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/system-admin/clients', icon: Building2 },
  { label: 'Quotes', href: '/system-admin/quotes', icon: MessageSquare },
];

export function SystemSidebar({ user }: SystemSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
          <ShieldAlert className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="font-heading text-base font-bold text-foreground">
            {APP_SHORT_NAME}
          </h1>
          <p className="text-xs text-muted-fg">System Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-red-500/10 text-red-500'
                  : 'text-muted-fg hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'text-red-500')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-sm font-medium text-red-500">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-muted-fg capitalize">System Admin</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-fg hover:bg-muted hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
