import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "gold" | "violet" | "cyan" | "none";
  hoverEffect?: boolean;
  density?: "comfortable" | "compact";
  tone?: "surface1" | "surface2";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      glowColor = "none",
      hoverEffect = true,
      density = "comfortable",
      tone = "surface1",
      ...props
    },
    ref,
  ) => {
    const glowClasses = {
      gold: "hover:border-gold-light/50 hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]",
      violet: "hover:border-violet/50 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
      cyan: "hover:border-cyan/50 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]",
      none: "",
    };
    const densityClasses = {
      comfortable: "p-6",
      compact: "p-4",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-xl border transition-all duration-300",
          "rounded-[var(--ui-radius-xl)]",
          densityClasses[density],
          tone === "surface1"
            ? "bg-[var(--ui-surface-1)] border-[color:var(--ui-border-soft)] shadow-[var(--ui-shadow-1)]"
            : "bg-[var(--ui-surface-2)] border-[color:var(--ui-border-strong)] shadow-[var(--ui-shadow-2)]",
          hoverEffect && "hover:border-[color:var(--ui-border-strong)] hover:shadow-[var(--ui-shadow-2)]",
          glowColor !== "none" && glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
