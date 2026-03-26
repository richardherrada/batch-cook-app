"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ─── Types ──────────────────────────────────────────────────────────────────

export type MacroInfo = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export type RecipeInstruction = {
  step: number;
  instruction: string;
  timerMinutes?: number;
};

export type RecipeSummary = {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  macros: MacroInfo;
  tags: string[];
  batchCookTips: string | null;
  imageUrl: string | null;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
};

export type RecipeDetail = RecipeSummary & {
  instructions: RecipeInstruction[];
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }[];
};

export type MealPlanSlot = {
  id: string;
  day: string;
  slot: string;
  recipeId: string;
  recipe: RecipeSummary;
};

export type MealPlan = {
  id: string;
  weekStartDate: string;
  createdAt: string;
  mealPlanSlots: MealPlanSlot[];
};

export type GroceryItemData = {
  id: string;
  ingredientId: string;
  totalQuantity: number;
  unit: string;
  isChecked: boolean;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
};

export type GroceryListData = {
  items: GroceryItemData[];
};

export type BatchCookTask = {
  id: string;
  description: string;
  order: number;
  isChecked: boolean;
  estimatedMinutes: number;
  section?: string;
};

export type BatchCookData = {
  id: string;
  tasks: BatchCookTask[];
  totalMinutes: number;
};

export type UserProfileData = {
  id: string;
  email: string;
  name: string | null;
  goal: string;
  dietaryRestrictions: string[];
  allergies: string[];
  foodDislikes: string[];
  servings: number;
  cookDay: string;
  subscriptionTier: string;
};

// ─── Fetcher ────────────────────────────────────────────────────────────────

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ─── Meal Plans ─────────────────────────────────────────────────────────────

export function useCurrentMealPlan() {
  return useQuery<MealPlan | null>({
    queryKey: ["meal-plans", "current"],
    queryFn: async () => {
      const res = await fetch("/api/meal-plans");
      if (res.status === 401) return null;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      return res.json();
    },
  });
}

export function useGenerateMealPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetcher<MealPlan>("/api/meal-plans", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-plans"] });
    },
  });
}

export function useAddToPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      day,
      slot,
      recipeId,
    }: {
      day: string;
      slot: string;
      recipeId: string;
    }) =>
      fetcher("/api/meal-plans/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, slot, recipeId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-plans"] });
    },
  });
}

export function useSwapMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      newRecipeId,
    }: {
      slotId: string;
      newRecipeId: string;
    }) =>
      fetcher<MealPlanSlot>(`/api/meal-plans/swap`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, newRecipeId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-plans"] });
    },
  });
}

// ─── Recipes ────────────────────────────────────────────────────────────────

export function useRecipes(params?: {
  search?: string;
  mealType?: string;
  difficulty?: string;
  tags?: string[];
  maxPrepTime?: number;
  page?: number;
  limit?: number;
}) {
  const limit = params?.limit ?? 12;
  const page = params?.page ?? 1;
  const offset = (page - 1) * limit;

  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.mealType) searchParams.set("mealType", params.mealType);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.tags?.length) searchParams.set("tags", params.tags.join(","));
  if (params?.maxPrepTime)
    searchParams.set("maxPrepTime", String(params.maxPrepTime));
  searchParams.set("limit", String(limit));
  searchParams.set("offset", String(offset));

  const qs = searchParams.toString();
  return useQuery<{ recipes: RecipeSummary[]; total: number; page: number; totalPages: number }>({
    queryKey: ["recipes", params],
    queryFn: async () => {
      const raw = await fetcher<{ recipes: RecipeSummary[]; total: number; limit: number; offset: number }>(
        `/api/recipes${qs ? `?${qs}` : ""}`
      );
      return {
        recipes: raw.recipes,
        total: raw.total,
        page,
        totalPages: Math.ceil(raw.total / limit),
      };
    },
  });
}

export function useRecipe(id: string) {
  return useQuery<RecipeDetail>({
    queryKey: ["recipes", id],
    queryFn: async () => {
      const raw = await fetcher<Record<string, unknown>>(`/api/recipes/${id}`);
      const recipeIngredients = (raw.recipeIngredients as Array<{
        id: string;
        quantity: number;
        ingredient: { id: string; name: string; unit: string; category: string };
      }>) || [];
      return {
        ...raw,
        ingredients: recipeIngredients.map((ri) => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.ingredient.unit,
          category: ri.ingredient.category,
        })),
      } as RecipeDetail;
    },
    enabled: !!id,
  });
}

export function useAlternativeRecipes(mealType: string, excludeId: string) {
  return useQuery<RecipeSummary[]>({
    queryKey: ["recipes", "alternatives", mealType, excludeId],
    queryFn: () =>
      fetcher(
        `/api/recipes?mealType=${mealType}&limit=5&exclude=${excludeId}`
      ).then((res: unknown) => (res as { recipes: RecipeSummary[] }).recipes),
    enabled: !!mealType,
  });
}

export type ImportResult = {
  matched: boolean;
  recipe?: RecipeDetail & { recipeIngredients: unknown[] };
  confidence?: string;
  explanation?: string;
  sourceUrl?: string;
  detectedDish?: string;
  suggestions?: unknown[];
};

export function useImportRecipe() {
  return useMutation({
    mutationFn: (url: string) =>
      fetcher<ImportResult>("/api/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }),
  });
}

// ─── Grocery List ───────────────────────────────────────────────────────────

export function useGroceryList(planId: string | null) {
  return useQuery<GroceryListData>({
    queryKey: ["grocery-list", planId],
    queryFn: () => fetcher(`/api/grocery-list/${planId}`),
    enabled: !!planId,
  });
}

export function useToggleGroceryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      itemId,
      isChecked,
    }: {
      planId: string;
      itemId: string;
      isChecked: boolean;
    }) =>
      fetcher(`/api/grocery-list/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: itemId, isChecked }] }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["grocery-list", variables.planId],
      });
    },
  });
}

export function useAddGroceryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      name,
      quantity,
      unit,
      category,
    }: {
      planId: string;
      name: string;
      quantity: number;
      unit: string;
      category: string;
    }) =>
      fetcher(`/api/grocery-list/${planId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, unit, category }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["grocery-list", variables.planId],
      });
    },
  });
}

// ─── Batch Cook ─────────────────────────────────────────────────────────────

export function useBatchChecklist(planId: string | null) {
  return useQuery<BatchCookData>({
    queryKey: ["batch-checklist", planId],
    queryFn: () => fetcher(`/api/batch-checklist/${planId}`),
    enabled: !!planId,
  });
}

export function useToggleBatchTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      taskId,
      isChecked,
    }: {
      planId: string;
      taskId: string;
      isChecked: boolean;
    }) =>
      fetcher(`/api/batch-checklist/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isChecked }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["batch-checklist", variables.planId],
      });
    },
  });
}

export function useResetBatchChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      fetcher(`/api/batch-checklist/${planId}/reset`, { method: "POST" }),
    onSuccess: (_data, planId) => {
      qc.invalidateQueries({ queryKey: ["batch-checklist", planId] });
    },
  });
}

// ─── User Profile ───────────────────────────────────────────────────────────

export function useUserProfile() {
  return useQuery<UserProfileData>({
    queryKey: ["user-profile"],
    queryFn: () => fetcher("/api/users/profile"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfileData>) =>
      fetcher<UserProfileData>("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      fetcher("/api/users/profile", { method: "DELETE" }),
  });
}
