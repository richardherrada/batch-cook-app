"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

const commonAllergens = ["Nuts", "Shellfish", "Eggs", "Soy", "Wheat", "Fish"];

const cookDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Profile
  const [goal, setGoal] = useState("GENERAL_HEALTH");
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [foodDislikes, setFoodDislikes] = useState("");
  const [servings, setServings] = useState(1);
  const [cookDay, setCookDay] = useState("sunday");

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          goal,
          dietaryRestrictions: selectedDiets,
          allergies: selectedAllergens,
          foodDislikes: foodDislikes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          servings,
          cookDay,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/meal-plan");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-2xl"
          >
            <ChefHat className="h-8 w-8 text-[var(--primary)]" />
            Batch Cook
          </Link>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {step === 1
              ? "Create your account to get started."
              : "Tell us about your dietary preferences."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                  placeholder="Min 8 characters"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  What&apos;s your goal?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {goals.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dietary restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {diets.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleItem(selectedDiets, d, setSelectedDiets)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
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
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
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

              <div>
                <label htmlFor="dislikes" className="block text-sm font-medium mb-1.5">
                  Food dislikes{" "}
                  <span className="text-[var(--muted-foreground)] font-normal">
                    (comma-separated)
                  </span>
                </label>
                <input
                  id="dislikes"
                  type="text"
                  value={foodDislikes}
                  onChange={(e) => setFoodDislikes(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                  placeholder="e.g. olives, mushrooms, cilantro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="servings" className="block text-sm font-medium mb-1.5">
                    Servings
                  </label>
                  <select
                    id="servings"
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
                  <label htmlFor="cookDay" className="block text-sm font-medium mb-1.5">
                    Cook day
                  </label>
                  <select
                    id="cookDay"
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
            </>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account…" : step === 1 ? "Next" : "Create account"}
            </button>
          </div>
        </form>

        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">
                  Or continue with
                </span>
              </div>
            </div>
            <button
              onClick={() => signIn("google", { callbackUrl: "/meal-plan" })}
              className="w-full rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
