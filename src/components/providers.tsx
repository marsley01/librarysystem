'use client';

import { ToastProvider, ToastViewport, Toast } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { useState, useCallback } from 'react';

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

let toastCount = 0;

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (props: Omit<ToastItem, 'id'>) => {
      const id = String(++toastCount);
      setToasts((prev) => [...prev, { ...props, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  if (typeof window !== 'undefined') {
    (window as any).__toast = addToast;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
          />
        ))}
        <ToastViewport />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export function toast(
  titleOrOpts: string | { title?: string; description?: string; variant?: 'default' | 'success' | 'error' | 'warning' },
  description?: string,
) {
  if (typeof window === 'undefined') return;
  const fn = (window as any).__toast;
  if (!fn) return;
  if (typeof titleOrOpts === 'string') {
    fn({ title: titleOrOpts, description, variant: 'default' });
  } else {
    fn(titleOrOpts);
  }
}
