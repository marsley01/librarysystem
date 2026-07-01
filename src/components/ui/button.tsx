import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A55A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0F] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#C5A55A] text-[#0B0B0F] hover:bg-[#B8953E] shadow-lg shadow-[#C5A55A]/20',
        destructive: 'bg-red-500/90 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
        outline: 'border border-[#2A2A35] bg-transparent text-[#E8E8ED] hover:bg-[#1E1E28] hover:border-[#C5A55A]/50',
        secondary: 'bg-[#1E1E28] text-[#E8E8ED] hover:bg-[#2A2A35]',
        ghost: 'text-[#9D9DA8] hover:text-[#E8E8ED] hover:bg-[#1E1E28]',
        link: 'text-[#C5A55A] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
