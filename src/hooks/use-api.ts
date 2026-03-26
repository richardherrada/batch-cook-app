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
  id: string;
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

export function useMealPlans() {
  return useQuery<MealPlan[]>({
    queryKey: ["meal-plans"],
    queryFn: () => fetcher("/api/meal-plans"),
  });
}

export function useCurrentMealPlan() {
  return useQuery<MealPlan | null>({
    queryKey: ["meal-plans", "current"],
    queryFn: async () => {
      const plans = await fetcher<MealPlan[]>("/api/meal-plans");
      return plans.length > 0 ? plans[0] : null;
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
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.mealType) searchParams.set("mealType", params.mealType);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.tags?.length) searchParams.set("tags", params.tags.join(","));
  if (params?.maxPrepTime)
    searchParams.set("maxPrepTime", String(params.maxPrepTime));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  return useQuery<{ recipes: RecipeSummary[]; total: number; page: number; totalPages: number }>({
    queryKey: ["recipes", params],
    queryFn: () => fetcher(`/api/recipes${qs ? `?${qs}` : ""}`),
  });
}

export function useRecipe(id: string) {
  return useQuery<RecipeDetail>({
    queryKey: ["recipes", id],
    queryFn: () => fetcher(`/api/recipes/${id}`),
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
        body: JSON.stringify({ itemId, isChecked }),
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
