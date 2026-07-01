import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#2A2A35] bg-[#14141A] px-3 py-2 text-sm text-[#E8E8ED] placeholder:text-[#6B6B7B] focus:outline-none focus:ring-2 focus:ring-[#C5A55A] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
