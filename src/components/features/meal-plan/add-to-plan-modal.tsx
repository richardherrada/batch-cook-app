"use client";

import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { useAddToPlan, type RecipeSummary } from "@/hooks/use-api";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
] as const;

const SLOTS = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
] as const;

interface AddToPlanModalProps {
  recipe: RecipeSummary;
  onClose: () => void;
}

export function AddToPlanModal({ recipe, onClose }: AddToPlanModalProps) {
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [selectedSlot, setSelectedSlot] = useState<string>(recipe.mealType);
  const [success, setSuccess] = useState(false);
  const addToPlan = useAddToPlan();

  function handleAdd() {
    addToPlan.mutate(
      { day: selectedDay, slot: selectedSlot, recipeId: recipe.id },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(onClose, 1200);
        },
      }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-sm">Add to meal plan</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Adding <strong>{recipe.name}</strong>
          </p>

          {/* Day selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Day
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDay(day.value)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors min-h-[40px] ${
                    selectedDay === day.value
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Slot selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Meal
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => setSelectedSlot(slot.value)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors min-h-[40px] ${
                    selectedSlot === slot.value
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {addToPlan.isError && (
            <p className="text-xs text-[var(--destructive)]">
              {addToPlan.error instanceof Error
                ? addToPlan.error.message
                : "Failed to add. Please sign in first."}
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={addToPlan.isPending || success}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
          >
            {success ? (
              <>
                <Check className="h-4 w-4" />
                Added!
              </>
            ) : addToPlan.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
