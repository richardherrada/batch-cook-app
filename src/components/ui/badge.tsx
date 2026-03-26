"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "easy" | "medium" | "hard" | "accent" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
  easy: "bg-green-50 text-[var(--color-easy)] border-[var(--color-easy)]/20 dark:bg-green-900/20",
  medium:
    "bg-amber-50 text-[var(--color-medium)] border-[var(--color-medium)]/20 dark:bg-amber-900/20",
  hard: "bg-red-50 text-[var(--color-hard)] border-[var(--color-hard)]/20 dark:bg-red-900/20",
  accent:
    "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
  muted:
    "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const variant =
    difficulty === "EASY"
      ? "easy"
      : difficulty === "MEDIUM"
        ? "medium"
        : "hard";
  const label =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
