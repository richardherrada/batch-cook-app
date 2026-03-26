"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface GroceryItemProps {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  disabled?: boolean;
}

export function GroceryItem({
  id,
  name,
  quantity,
  unit,
  isChecked,
  onToggle,
  disabled,
}: GroceryItemProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors min-h-[44px]",
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
            "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all",
            isChecked
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--border)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)]"
          )}
        >
          {isChecked && (
            <Check className="h-4 w-4 text-[var(--primary-foreground)]" />
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
        {name}
      </span>

      <span
        className={cn(
          "text-sm font-medium text-[var(--muted-foreground)] whitespace-nowrap",
          isChecked && "opacity-60"
        )}
      >
        {quantity} {unit}
      </span>
    </label>
  );
}
