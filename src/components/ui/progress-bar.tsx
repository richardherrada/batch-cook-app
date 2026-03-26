"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  label?: string;
  showPercentage?: boolean;
  variant?: "primary" | "accent";
}

export function ProgressBar({
  value,
  className,
  label,
  showPercentage = true,
  variant = "primary",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const bgColor =
    variant === "accent" ? "bg-[var(--accent)]" : "bg-[var(--primary)]";

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-[var(--foreground)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-[var(--muted-foreground)]">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", bgColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
