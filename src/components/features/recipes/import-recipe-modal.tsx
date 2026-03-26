"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  ExternalLink,
  ChefHat,
  AlertCircle,
  Clock,
  Flame,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badge";
import { useImportRecipe } from "@/hooks/use-api";

interface ImportRecipeModalProps {
  onClose: () => void;
  onAddToPlan?: (recipeId: string) => void;
}

export function ImportRecipeModal({
  onClose,
  onAddToPlan,
}: ImportRecipeModalProps) {
  const [url, setUrl] = useState("");
  const importRecipe = useImportRecipe();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    importRecipe.mutate(url.trim());
  }

  const result = importRecipe.data;
  const recipe = result?.recipe;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl max-h-[85vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-sm">Import from link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* URL input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              Paste an Instagram or TikTok link and we&apos;ll find a matching
              recipe from our library.
            </p>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/... or https://www.tiktok.com/..."
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                disabled={importRecipe.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={importRecipe.isPending || !url.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
            >
              {importRecipe.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Find matching recipe
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {importRecipe.isError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--destructive)] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[var(--destructive)]">
                {importRecipe.error instanceof Error
                  ? importRecipe.error.message
                  : "Something went wrong. Check the URL and try again."}
              </p>
            </div>
          )}

          {/* Match result */}
          {result && !importRecipe.isPending && (
            <div className="space-y-3">
              {result.matched && recipe ? (
                <>
                  {/* Confidence indicator */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        result.confidence === "high"
                          ? "bg-[var(--color-easy)]"
                          : result.confidence === "medium"
                            ? "bg-[var(--color-medium)]"
                            : "bg-[var(--color-hard)]"
                      }`}
                    />
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      {result.confidence === "high"
                        ? "Strong match"
                        : result.confidence === "medium"
                          ? "Good match"
                          : "Possible match"}
                    </span>
                  </div>

                  {/* Matched recipe card */}
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{recipe.name}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prepTime + recipe.cookTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {recipe.macros.calories} cal
                      </span>
                      <DifficultyBadge difficulty={recipe.difficulty} />
                    </div>

                    {/* AI explanation */}
                    {result.explanation && (
                      <p className="text-xs text-[var(--muted-foreground)] italic border-t border-[var(--border)] pt-2">
                        {result.explanation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      onClick={onClose}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]"
                    >
                      View recipe
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    {onAddToPlan && (
                      <button
                        onClick={() => {
                          onAddToPlan(recipe.id);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity min-h-[44px]"
                      >
                        Add to plan
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* No match */
                <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-4 text-center space-y-2">
                  <ChefHat className="h-8 w-8 text-[var(--muted-foreground)] mx-auto opacity-50" />
                  <p className="text-sm font-medium">No matching recipe found</p>
                  {result.detectedDish && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      We detected: <strong>{result.detectedDish}</strong>
                    </p>
                  )}
                  {result.explanation && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {result.explanation}
                    </p>
                  )}
                  <Link
                    href="/recipes"
                    onClick={onClose}
                    className="inline-block mt-2 text-xs text-[var(--primary)] hover:underline"
                  >
                    Browse all recipes instead
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
