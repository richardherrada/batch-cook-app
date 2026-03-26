"use client";

import { useState, useCallback } from "react";
import {
  CalendarDays,
  Flame,
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { MealSlotCard } from "@/components/features/meal-plan/meal-slot-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentMealPlan,
  useGenerateMealPlan,
  useSwapMeal,
  useAlternativeRecipes,
  type MealPlanSlot,
  type MacroInfo,
} from "@/hooks/use-api";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const SLOTS = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

const SLOT_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

function getDayMacros(slots: MealPlanSlot[], day: string): MacroInfo {
  return slots
    .filter((s) => s.day === day)
    .reduce(
      (acc, s) => ({
        protein: acc.protein + (s.recipe.macros.protein || 0),
        carbs: acc.carbs + (s.recipe.macros.carbs || 0),
        fat: acc.fat + (s.recipe.macros.fat || 0),
        calories: acc.calories + (s.recipe.macros.calories || 0),
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function MealPlanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Day filter skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-16 rounded-lg flex-shrink-0" />
        ))}
      </div>
      {/* Macro summary skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error Card ─────────────────────────────────────────────────────────────

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center space-y-3">
      <AlertCircle className="h-8 w-8 text-[var(--destructive)] mx-auto" />
      <p className="text-sm text-[var(--destructive)]">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity min-h-[44px]"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// ─── Swap Modal ─────────────────────────────────────────────────────────────

function SwapModal({
  slot,
  onClose,
  onSwap,
}: {
  slot: MealPlanSlot;
  onClose: () => void;
  onSwap: (slotId: string, newRecipeId: string) => void;
}) {
  const { data: alternatives, isLoading } = useAlternativeRecipes(
    slot.recipe.mealType,
    slot.recipeId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold">Swap meal</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Replace <strong>{slot.recipe.name}</strong> with:
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : alternatives && alternatives.length > 0 ? (
            alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => onSwap(slot.id, alt.id)}
                className="w-full text-left rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)] transition-colors min-h-[44px]"
              >
                <div className="font-medium text-sm">{alt.name}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  {alt.macros.calories} cal &middot; P{alt.macros.protein}g /
                  C{alt.macros.carbs}g / F{alt.macros.fat}g
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
              No alternatives found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--primary)]/10">
        <CalendarDays className="h-8 w-8 text-[var(--primary)]" />
      </div>
      <h2 className="text-xl font-bold">No meal plan yet</h2>
      <p className="text-[var(--muted-foreground)] max-w-sm">
        Generate your first weekly meal plan tailored to your dietary preferences
        and goals.
      </p>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isGenerating ? "Generating..." : "Generate your first meal plan"}
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MealPlanPage() {
  const { data: plan, isLoading, error, refetch } = useCurrentMealPlan();
  const generatePlan = useGenerateMealPlan();
  const swapMeal = useSwapMeal();

  const [activeDay, setActiveDay] = useState<string>("MONDAY");
  const [activeSlotFilter, setActiveSlotFilter] = useState<string | null>(null);
  const [swappingSlot, setSwappingSlot] = useState<MealPlanSlot | null>(null);

  const handleSwap = useCallback(
    (slotId: string, newRecipeId: string) => {
      swapMeal.mutate(
        { slotId, newRecipeId },
        { onSuccess: () => setSwappingSlot(null) }
      );
    },
    [swapMeal]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
        <MealPlanSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
        <ErrorCard
          message="Failed to load your meal plan. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
        <EmptyState
          onGenerate={() => generatePlan.mutate()}
          isGenerating={generatePlan.isPending}
        />
      </div>
    );
  }

  const slots = plan.mealPlanSlots || [];
  const dayMacros = getDayMacros(slots, activeDay);

  const filteredSlots = slots.filter((s) => {
    if (s.day !== activeDay) return false;
    if (activeSlotFilter && s.slot !== activeSlotFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
        <button
          onClick={() => generatePlan.mutate()}
          disabled={generatePlan.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
        >
          {generatePlan.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          New plan
        </button>
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
              activeDay === day
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>

      {/* Daily macro summary */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold">
            {DAY_LABELS[activeDay]} Summary
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[var(--accent)]">
              {dayMacros.calories}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Calories
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--primary)]">
              {dayMacros.protein}g
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Protein
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-orange-500)]">
              {dayMacros.carbs}g
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Carbs
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-sage-500)]">
              {dayMacros.fat}g
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Fat
            </p>
          </div>
        </div>
      </div>

      {/* Meal type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSlotFilter(null)}
          className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
            activeSlotFilter === null
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
          }`}
        >
          All meals
        </button>
        {SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() =>
              setActiveSlotFilter(activeSlotFilter === slot ? null : slot)
            }
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
              activeSlotFilter === slot
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {SLOT_LABELS[slot]}
          </button>
        ))}
      </div>

      {/* Meal slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot) => (
            <MealSlotCard
              key={slot.id}
              slot={slot}
              onSwap={setSwappingSlot}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)] text-sm">
            No meals for this selection.
          </div>
        )}
      </div>

      {/* Swap modal */}
      {swappingSlot && (
        <SwapModal
          slot={swappingSlot}
          onClose={() => setSwappingSlot(null)}
          onSwap={handleSwap}
        />
      )}
    </div>
  );
}
