import type { HTMLAttributes } from "react";

type BrandProps = HTMLAttributes<HTMLSpanElement> & {
  compact?: boolean;
};

export function Brand({ compact = false, className = "", ...props }: BrandProps) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-semibold tracking-tight ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="relative grid size-10 place-items-center rounded-full border border-[var(--gold)] bg-[var(--surface)] font-display text-xl font-semibold text-[var(--foreground)] shadow-sm"
      >
        C
        <span className="absolute -bottom-0.5 size-1.5 rounded-full bg-[var(--sage)]" />
      </span>
      {!compact && <span className="font-display text-xl">Cruz Agenda</span>}
    </span>
  );
}
