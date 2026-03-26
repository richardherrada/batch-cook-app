"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Flame,
  Users,
  ChefHat,
  Timer,
  Minus,
  Plus,
  CalendarPlus,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { DifficultyBadge, Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipe } from "@/hooks/use-api";

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function RecipeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

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

// ─── Macro Bar ──────────────────────────────────────────────────────────────

function MacroBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">{label}</span>
        <span className="font-semibold">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: recipe, isLoading, error, refetch } = useRecipe(id);
  const [servingScale, setServingScale] = useState(1);
  const [activeTimers, setActiveTimers] = useState<Record<number, boolean>>({});

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (error || !recipe) {
    return (
      <div className="space-y-6">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>
        <ErrorCard
          message="Failed to load recipe details."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const scaledServings = recipe.servings * servingScale;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      {/* Hero */}
      <div className="rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="h-48 md:h-64 bg-[var(--color-green-100)] flex items-center justify-center">
          <UtensilsCrossed className="h-16 w-16 text-[var(--primary)] opacity-30" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{recipe.name}</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {recipe.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {[
          {
            icon: Clock,
            label: "Prep",
            value: `${recipe.prepTime}m`,
          },
          {
            icon: Clock,
            label: "Cook",
            value: `${recipe.cookTime}m`,
          },
          {
            icon: Users,
            label: "Servings",
            value: String(recipe.servings),
          },
          {
            icon: ChefHat,
            label: "Difficulty",
            value: recipe.difficulty,
            isBadge: true,
          },
          {
            icon: Flame,
            label: "Calories",
            value: `${recipe.macros.calories}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center"
          >
            <stat.icon className="h-4 w-4 mx-auto text-[var(--muted-foreground)] mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              {stat.label}
            </p>
            {stat.isBadge ? (
              <div className="mt-1">
                <DifficultyBadge difficulty={stat.value} />
              </div>
            ) : (
              <p className="text-sm font-bold mt-0.5">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Macros breakdown */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <h2 className="font-semibold">Nutritional Info</h2>
        <MacroBar
          label="Protein"
          value={recipe.macros.protein}
          max={200}
          color="var(--primary)"
          unit="g"
        />
        <MacroBar
          label="Carbs"
          value={recipe.macros.carbs}
          max={300}
          color="var(--color-orange-500)"
          unit="g"
        />
        <MacroBar
          label="Fat"
          value={recipe.macros.fat}
          max={150}
          color="var(--color-sage-500)"
          unit="g"
        />
        <MacroBar
          label="Calories"
          value={recipe.macros.calories}
          max={2500}
          color="var(--accent)"
          unit=" kcal"
        />
      </div>

      {/* Ingredients */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Ingredients</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServingScale((s) => Math.max(0.5, s - 0.5))}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {scaledServings} serving{scaledServings !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setServingScale((s) => s + 0.5)}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {recipe.ingredients.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <span>{ing.name}</span>
              <span className="text-[var(--muted-foreground)] font-medium">
                {Math.round(ing.quantity * servingScale * 10) / 10} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <h2 className="font-semibold">Instructions</h2>
        <ol className="space-y-4">
          {recipe.instructions.map((step) => (
            <li key={step.step} className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold">
                {step.step}
              </span>
              <div className="flex-1 pt-0.5">
                <p className="text-sm leading-relaxed">{step.instruction}</p>
                {step.timerMinutes && (
                  <button
                    onClick={() =>
                      setActiveTimers((prev) => ({
                        ...prev,
                        [step.step]: !prev[step.step],
                      }))
                    }
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                      activeTimers[step.step]
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                    }`}
                  >
                    <Timer className="h-3.5 w-3.5" />
                    {activeTimers[step.step]
                      ? `Timer running (${step.timerMinutes}m)`
                      : `Set timer: ${step.timerMinutes}m`}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Batch cooking tips */}
      {recipe.batchCookTips && (
        <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--accent)]">
              Batch Cooking Tips
            </h2>
          </div>
          <p className="text-sm leading-relaxed">{recipe.batchCookTips}</p>
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Add to plan CTA */}
      <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] py-3.5 font-medium hover:opacity-90 transition-opacity min-h-[44px]">
        <CalendarPlus className="h-5 w-5" />
        Add to this week&apos;s plan
      </button>
    </div>
  );
}
