import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-strong)] focus-visible:outline-[var(--brand)]",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-soft)] focus-visible:outline-[var(--brand)]",
  ghost:
    "text-[var(--foreground-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-[var(--brand)]",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
