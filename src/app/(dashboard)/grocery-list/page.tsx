"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCheck,
  Plus,
  FileDown,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  X,
} from "lucide-react";
import { GroceryItem } from "@/components/features/grocery-list/grocery-item";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import {
  useCurrentMealPlan,
  useGroceryList,
  useToggleGroceryItem,
  useAddGroceryItem,
  type GroceryItemData,
} from "@/hooks/use-api";

const CATEGORY_ORDER = [
  "PRODUCE",
  "PROTEIN",
  "DAIRY",
  "PANTRY",
  "FROZEN",
  "SPICES",
  "OTHER",
];

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCE: "Produce",
  PROTEIN: "Protein",
  DAIRY: "Dairy",
  PANTRY: "Pantry",
  FROZEN: "Frozen",
  SPICES: "Spices",
  OTHER: "Other",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  PRODUCE: "🥬",
  PROTEIN: "🥩",
  DAIRY: "🧀",
  PANTRY: "🫙",
  FROZEN: "🧊",
  SPICES: "🌶️",
  OTHER: "📦",
};

function GroceryListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
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

// ─── Add Item Form ──────────────────────────────────────────────────────────

function AddItemForm({
  planId,
  onClose,
}: {
  planId: string;
  onClose: () => void;
}) {
  const addItem = useAddGroceryItem();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [category, setCategory] = useState("OTHER");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addItem.mutate(
      {
        planId,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit,
        category,
      },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Add item</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        autoFocus
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0.1"
          step="0.1"
          className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <input
          type="text"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!name.trim() || addItem.isPending}
        className="w-full rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 min-h-[44px]"
      >
        {addItem.isPending ? "Adding..." : "Add item"}
      </button>
    </form>
  );
}

// ─── Category Section ───────────────────────────────────────────────────────

function CategorySection({
  category,
  items,
  planId,
}: {
  category: string;
  items: GroceryItemData[];
  planId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleItem = useToggleGroceryItem();

  const checkedCount = items.filter((i) => i.isChecked).length;
  const allChecked = checkedCount === items.length && items.length > 0;

  function handleCheckAll() {
    const newChecked = !allChecked;
    items.forEach((item) => {
      if (item.isChecked !== newChecked) {
        toggleItem.mutate({
          planId,
          itemId: item.id,
          isChecked: newChecked,
        });
      }
    });
  }

  function handleToggle(itemId: string, checked: boolean) {
    toggleItem.mutate({ planId, itemId, isChecked: checked });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors min-h-[44px]"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
        )}
        <span className="text-base">
          {CATEGORY_EMOJIS[category] || "📦"}
        </span>
        <span className="font-semibold text-sm flex-1 text-left">
          {CATEGORY_LABELS[category] || category}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {checkedCount}/{items.length}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-[var(--border)]">
          {/* Check all button */}
          <button
            onClick={handleCheckAll}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors min-h-[36px]"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {allChecked ? "Uncheck all" : "Check all"}
          </button>

          {/* Items */}
          <div className="divide-y divide-[var(--border)]/50 px-1">
            {items.map((item) => (
              <GroceryItem
                key={item.id}
                id={item.id}
                name={item.ingredient.name}
                quantity={item.totalQuantity}
                unit={item.unit}
                isChecked={item.isChecked}
                onToggle={handleToggle}
                disabled={toggleItem.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function GroceryListPage() {
  const { data: plan, isLoading: planLoading } = useCurrentMealPlan();
  const planId = plan?.id ?? null;
  const {
    data: groceryData,
    isLoading: groceryLoading,
    error,
    refetch,
  } = useGroceryList(planId);
  const [showAddForm, setShowAddForm] = useState(false);

  const isLoading = planLoading || groceryLoading;

  const groupedItems = useMemo(() => {
    if (!groceryData?.items) return {};
    const groups: Record<string, GroceryItemData[]> = {};
    for (const item of groceryData.items) {
      const cat = item.ingredient.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [groceryData]);

  const sortedCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter((c) => groupedItems[c]?.length > 0).concat(
        Object.keys(groupedItems).filter((c) => !CATEGORY_ORDER.includes(c))
      ),
    [groupedItems]
  );

  const totalItems = groceryData?.items.length ?? 0;
  const checkedItems = groceryData?.items.filter((i) => i.isChecked).length ?? 0;
  const progressPct = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <GroceryListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <ErrorCard
          message="Failed to load your grocery list."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!planId || totalItems === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--primary)]/10">
            <ShoppingCart className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold">No grocery list yet</h2>
          <p className="text-[var(--muted-foreground)] max-w-sm">
            Generate a meal plan first, and your grocery list will be created
            automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add item</span>
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={progressPct}
        label={`${checkedItems} of ${totalItems} items`}
      />

      {/* Add item form */}
      {showAddForm && planId && (
        <AddItemForm planId={planId} onClose={() => setShowAddForm(false)} />
      )}

      {/* Category sections */}
      <div className="space-y-3">
        {sortedCategories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            items={groupedItems[category]}
            planId={planId}
          />
        ))}
      </div>
    </div>
  );
}
