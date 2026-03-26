"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { RecipeCard } from "@/components/features/recipes/recipe-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useRecipes, type RecipeSummary } from "@/hooks/use-api";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const TAG_OPTIONS = [
  "high-protein",
  "gluten-free",
  "dairy-free",
  "low-carb",
  "vegan",
  "vegetarian",
  "quick",
  "budget",
];
const PREP_TIME_OPTIONS = [15, 30, 45, 60];

function RecipesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
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

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(
    () => ({
      search: search || undefined,
      mealType: mealType || undefined,
      difficulty: difficulty || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      maxPrepTime: maxPrepTime || undefined,
      page,
      limit: 12,
    }),
    [search, mealType, difficulty, selectedTags, maxPrepTime, page]
  );

  const { data, isLoading, error, refetch } = useRecipes(params);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  }

  function clearFilters() {
    setMealType(null);
    setDifficulty(null);
    setSelectedTags([]);
    setMaxPrepTime(null);
    setPage(1);
  }

  const hasActiveFilters =
    mealType || difficulty || selectedTags.length > 0 || maxPrepTime;

  function handleAddToPlan(recipe: RecipeSummary) {
    // Placeholder: would open a modal to select day/slot
    console.log("Add to plan:", recipe.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recipe Library</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
            showFilters || hasActiveFilters
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] hover:bg-[var(--muted)]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
          {/* Meal type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Meal type
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt}
                  onClick={() => {
                    setMealType(mealType === mt ? null : mt);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                    mealType === mt
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {mt.charAt(0) + mt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                    selectedTags.includes(tag)
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(difficulty === d ? null : d);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                    difficulty === d
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Max prep time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Max prep time
            </label>
            <div className="flex flex-wrap gap-2">
              {PREP_TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setMaxPrepTime(maxPrepTime === t ? null : t);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                    maxPrepTime === t
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[var(--destructive)] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <RecipesSkeleton />
      ) : error ? (
        <ErrorCard
          message="Failed to load recipes. Please try again."
          onRetry={() => refetch()}
        />
      ) : data && data.recipes.length > 0 ? (
        <>
          <p className="text-sm text-[var(--muted-foreground)]">
            {data.total} recipe{data.total !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onAddToPlan={handleAddToPlan}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-[var(--muted-foreground)] px-3">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-[var(--muted-foreground)]">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            No recipes match your filters.{" "}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[var(--primary)] hover:underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
