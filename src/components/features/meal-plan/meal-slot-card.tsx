"use client";

import Link from "next/link";
import {
  Clock,
  Flame,
  RefreshCw,
  ChefHat,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badge";
import type { MealPlanSlot } from "@/hooks/use-api";

interface MealSlotCardProps {
  slot: MealPlanSlot;
  onSwap?: (slot: MealPlanSlot) => void;
}

export function MealSlotCard({ slot, onSwap }: MealSlotCardProps) {
  const { recipe } = slot;

  const slotLabel =
    slot.slot.charAt(0) + slot.slot.slice(1).toLowerCase();

  const slotColors: Record<string, string> = {
    BREAKFAST: "border-l-[var(--color-orange-400)]",
    LUNCH: "border-l-[var(--color-green-400)]",
    DINNER: "border-l-[var(--color-sage-500)]",
    SNACK: "border-l-[var(--color-cream-300)]",
  };

  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 border-l-4 ${slotColors[slot.slot] || ""} hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {slotLabel}
        </span>
        <DifficultyBadge difficulty={recipe.difficulty} />
      </div>

      <Link href={`/recipes/${recipe.id}`}>
        <h4 className="font-medium text-sm leading-tight line-clamp-2 hover:text-[var(--primary)] transition-colors">
          {recipe.name}
        </h4>
      </Link>

      <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {recipe.prepTime + recipe.cookTime}m
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {recipe.macros.calories} cal
        </span>
        {recipe.batchCookTips && (
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <ChefHat className="h-3 w-3" />
            Batch
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
        <span>P {recipe.macros.protein}g</span>
        <span className="text-[var(--border)]">/</span>
        <span>C {recipe.macros.carbs}g</span>
        <span className="text-[var(--border)]">/</span>
        <span>F {recipe.macros.fat}g</span>
      </div>

      {onSwap && (
        <button
          onClick={() => onSwap(slot)}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] py-1.5 w-full text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors min-h-[44px]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Swap meal
        </button>
      )}
    </div>
  );
}
