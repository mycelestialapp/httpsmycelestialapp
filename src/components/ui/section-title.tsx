import { cn } from '@/lib/utils';

export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {eyebrow && (
        <p className="text-sm font-medium tracking-[0.22em] uppercase text-[color:var(--ui-text-weak)]">
          {eyebrow}
        </p>
      )}
      <h2
        className="text-2xl sm:text-3xl font-semibold tracking-wide text-[hsl(var(--gold))]"
        style={{ fontFamily: 'var(--font-serif)', textShadow: '0 0 18px hsla(var(--gold) / 0.18)' }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-base sm:text-lg text-[color:var(--ui-text-muted)] leading-relaxed">{subtitle}</p>}
    </div>
  );
}

