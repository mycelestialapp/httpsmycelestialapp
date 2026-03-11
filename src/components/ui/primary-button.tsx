import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

export function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        'h-12 sm:h-[52px] rounded-xl px-6 text-base sm:text-lg font-semibold tracking-wide',
        'border border-gold-strong/40 text-gold-strong',
        'bg-gradient-to-b from-gold-strong/20 to-gold-strong/5',
        'shadow-[0_14px_30px_rgba(0,0,0,0.35)]',
        'hover:from-gold-strong/25 hover:to-gold-strong/10 hover:border-gold-strong/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-strong/35',
        className,
      )}
    />
  );
}

