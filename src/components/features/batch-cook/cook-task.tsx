"use client";

import { cn } from "@/lib/utils";
import { Check, Timer } from "lucide-react";

interface CookTaskProps {
  id: string;
  description: string;
  estimatedMinutes: number;
  isChecked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function CookTask({
  id,
  description,
  estimatedMinutes,
  isChecked,
  onToggle,
  disabled,
  hint,
}: CookTaskProps) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer transition-colors min-h-[44px]",
          isChecked
            ? "bg-[var(--muted)]/50"
            : "hover:bg-[var(--muted)]"
        )}
      >
        {/* Large touch target checkbox */}
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(id, !isChecked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={cn(
              "h-7 w-7 rounded-md border-2 flex items-center justify-center transition-all",
              isChecked
                ? "bg-[var(--primary)] border-[var(--primary)]"
                : "border-[var(--border)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)]"
            )}
          >
            {isChecked && (
              <Check className="h-5 w-5 text-[var(--primary-foreground)]" />
            )}
          </div>
        </div>

        <span
          className={cn(
            "flex-1 text-sm transition-all",
            isChecked &&
              "line-through text-[var(--muted-foreground)] opacity-60"
          )}
        >
          {description}
        </span>

        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap",
            isChecked
              ? "bg-[var(--muted)] text-[var(--muted-foreground)] opacity-60"
              : "bg-[var(--accent)]/10 text-[var(--accent)]"
          )}
        >
          <Timer className="h-3 w-3" />
          {estimatedMinutes}m
        </span>
      </label>

      {hint && !isChecked && (
        <p className="ml-12 text-xs text-[var(--accent)] italic">
          {hint}
        </p>
      )}
    </div>
  );
}
