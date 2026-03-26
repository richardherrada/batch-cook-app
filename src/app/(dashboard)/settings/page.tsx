"use client";

import { useState, useEffect } from "react";
import {
  User,
  Save,
  AlertTriangle,
  Trash2,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useUserProfile,
  useUpdateProfile,
  useDeleteAccount,
} from "@/hooks/use-api";
import { signOut } from "next-auth/react";

const goals = [
  { value: "WEIGHT_LOSS", label: "Weight loss" },
  { value: "MUSCLE_GAIN", label: "Muscle gain" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "GENERAL_HEALTH", label: "General health" },
];

const diets = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
];

const commonAllergens = [
  "Nuts",
  "Shellfish",
  "Eggs",
  "Soy",
  "Wheat",
  "Fish",
];

const cookDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const tierLabels: Record<string, { name: string; description: string }> = {
  FREE: {
    name: "Free",
    description: "1 saved meal plan, 20 recipes, basic grocery list",
  },
  PRO: {
    name: "Pro",
    description:
      "Unlimited plans, full recipe library, AI generation, PDF export",
  },
  FAMILY: {
    name: "Family",
    description: "Up to 6 profiles, shared grocery list, all Pro features",
  },
};

// ─── Skeletons & Errors ─────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
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

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: profile, isLoading, error, refetch } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [editing, setEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("GENERAL_HEALTH");
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [foodDislikes, setFoodDislikes] = useState("");
  const [servings, setServings] = useState(1);
  const [cookDay, setCookDay] = useState("sunday");

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setGoal(profile.goal);
      setSelectedDiets(profile.dietaryRestrictions);
      setSelectedAllergens(profile.allergies);
      setFoodDislikes(profile.foodDislikes.join(", "));
      setServings(profile.servings);
      setCookDay(profile.cookDay);
    }
  }, [profile]);

  function toggleItem(
    list: string[],
    item: string,
    setter: (v: string[]) => void
  ) {
    setter(
      list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item]
    );
  }

  function handleSave() {
    updateProfile.mutate(
      {
        name,
        goal,
        dietaryRestrictions: selectedDiets,
        allergies: selectedAllergens,
        foodDislikes: foodDislikes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        servings,
        cookDay,
      },
      {
        onSuccess: () => {
          setEditing(false);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 3000);
        },
      }
    );
  }

  function handleDelete() {
    deleteAccount.mutate(undefined, {
      onSuccess: () => signOut({ callbackUrl: "/" }),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <SettingsSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <ErrorCard
          message="Failed to load your profile."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const tier = tierLabels[profile.subscriptionTier] || tierLabels.FREE;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {showSaved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] font-medium">
            <CheckCircle className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      {/* Profile section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--primary)]/10">
              <User className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold">{profile.name || "User"}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {profile.email}
              </p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 pt-2 border-t border-[var(--border)]">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium mb-2">Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                      goal === g.value
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary restrictions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Dietary restrictions
              </label>
              <div className="flex flex-wrap gap-2">
                {diets.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedDiets, d, setSelectedDiets)
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors min-h-[36px] ${
                      selectedDiets.includes(d)
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Allergies
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAllergens.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedAllergens, a, setSelectedAllergens)
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors min-h-[36px] ${
                      selectedAllergens.includes(a)
                        ? "border-[var(--destructive)] bg-red-50 dark:bg-red-900/20 text-[var(--destructive)]"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Food dislikes */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Food dislikes{" "}
                <span className="text-[var(--muted-foreground)] font-normal">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={foodDislikes}
                onChange={(e) => setFoodDislikes(e.target.value)}
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="e.g. olives, mushrooms, cilantro"
              />
            </div>

            {/* Servings & Cook day */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Servings
                </label>
                <select
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Cook day
                </label>
                <select
                  value={cookDay}
                  onChange={(e) => setCookDay(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  {cookDays.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--muted-foreground)]">Goal</p>
                <p className="font-medium">
                  {goals.find((g) => g.value === profile.goal)?.label ||
                    profile.goal}
                </p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Servings</p>
                <p className="font-medium">
                  {profile.servings} person
                  {profile.servings !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Cook day</p>
                <p className="font-medium capitalize">{profile.cookDay}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Diets</p>
                <p className="font-medium">
                  {profile.dietaryRestrictions.length > 0
                    ? profile.dietaryRestrictions.join(", ")
                    : "None"}
                </p>
              </div>
            </div>
            {profile.allergies.length > 0 && (
              <div className="text-sm">
                <p className="text-[var(--muted-foreground)]">Allergies</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile.allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center rounded-full border border-[var(--destructive)]/20 bg-red-50 dark:bg-red-900/20 px-2.5 py-0.5 text-xs font-medium text-[var(--destructive)]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.foodDislikes.length > 0 && (
              <div className="text-sm">
                <p className="text-[var(--muted-foreground)]">Dislikes</p>
                <p className="font-medium">
                  {profile.foodDislikes.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscription section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-[var(--muted-foreground)]" />
          <h2 className="font-semibold">Subscription</h2>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] p-4">
          <div>
            <p className="font-semibold">{tier.name} Plan</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              {tier.description}
            </p>
          </div>
          {profile.subscriptionTier === "FREE" && (
            <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-0.5 text-xs font-medium">
              Free
            </span>
          )}
        </div>
        {profile.subscriptionTier === "FREE" && (
          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] py-3 font-medium hover:opacity-90 transition-opacity min-h-[44px]">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {profile.subscriptionTier !== "FREE" && (
          <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-3 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]">
            Manage subscription
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-[var(--destructive)]/30 bg-red-50/50 dark:bg-red-900/10 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--destructive)]" />
          <h2 className="font-semibold text-[var(--destructive)]">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Once you delete your account, there is no going back. All your data
          including meal plans, preferences, and subscription will be permanently
          removed.
        </p>
        {confirmDelete ? (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteAccount.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--destructive)] text-[var(--destructive-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
            >
              {deleteAccount.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Yes, delete my account
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--destructive)]/50 px-4 py-2.5 text-sm font-medium text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
