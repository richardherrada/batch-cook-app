"use client";

import Link from "next/link";
import { Clock, Flame, UtensilsCrossed, Plus } from "lucide-react";
import { DifficultyBadge, Badge } from "@/components/ui/badge";
import type { RecipeSummary } from "@/hooks/use-api";

interface RecipeCardProps {
  recipe: RecipeSummary;
  onAddToPlan?: (recipe: RecipeSummary) => void;
  showAddButton?: boolean;
}

export function RecipeCard({
  recipe,
  onAddToPlan,
  showAddButton = true,
}: RecipeCardProps) {
  const mealTypeColors: Record<string, string> = {
    BREAKFAST: "bg-[var(--color-orange-100)] text-[var(--color-orange-700)]",
    LUNCH: "bg-[var(--color-green-100)] text-[var(--color-green-700)]",
    DINNER: "bg-[var(--color-sage-100)] text-[var(--color-sage-600)]",
    SNACK: "bg-[var(--color-cream-200)] text-[var(--color-orange-800)]",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image placeholder */}
      <Link href={`/recipes/${recipe.id}`}>
        <div
          className={`h-36 flex items-center justify-center ${mealTypeColors[recipe.mealType] || "bg-[var(--muted)]"}`}
        >
          <UtensilsCrossed className="h-10 w-10 opacity-40" />
        </div>
      </Link>

      <div className="p-4 space-y-2.5">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {recipe.name}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.prepTime + recipe.cookTime}m
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {recipe.macros.calories} cal
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span>P {recipe.macros.protein}g</span>
          <span className="text-[var(--border)]">/</span>
          <span>C {recipe.macros.carbs}g</span>
          <span className="text-[var(--border)]">/</span>
          <span>F {recipe.macros.fat}g</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <DifficultyBadge difficulty={recipe.difficulty} />
          {recipe.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>

        {showAddButton && onAddToPlan && (
          <button
            onClick={() => onAddToPlan(recipe)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors min-h-[44px]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add to plan
          </button>
        )}
      </div>
    </div>
  );
}
