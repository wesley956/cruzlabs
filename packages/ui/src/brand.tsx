import type { HTMLAttributes } from "react";

type BrandProps = HTMLAttributes<HTMLSpanElement> & {
  compact?: boolean;
};

export function Brand({ compact = false, className = "", ...props }: BrandProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-lg font-bold text-white shadow-sm"
      >
        C
      </span>
      {!compact && <span>Cruz Agenda</span>}
    </span>
  );
}
