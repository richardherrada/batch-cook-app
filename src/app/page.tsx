import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingCart,
  CalendarDays,
  ChefHat,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Weekly Meal Plans",
    description:
      "Get a personalised 7-day meal plan based on your dietary goals and preferences.",
  },
  {
    icon: UtensilsCrossed,
    title: "Recipe Library",
    description:
      "Browse hundreds of batch-cook-friendly recipes with full macros and step-by-step instructions.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Grocery Lists",
    description:
      "Auto-generated, consolidated shopping lists grouped by aisle. Never forget an ingredient.",
  },
  {
    icon: ChefHat,
    title: "Batch Cook Day",
    description:
      "A guided checklist for your cook day with parallel tasks, timers, and portioning instructions.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description:
      "Claude generates meal plans tailored to your goals, swaps recipes you don't like, and answers cooking questions.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <ChefHat className="h-7 w-7 text-[var(--primary)]" />
            <span>Batch Cook</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-1.5 text-sm text-[var(--secondary-foreground)] mb-6">
          <Sparkles className="h-4 w-4" />
          AI-powered meal planning
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Meal prep your week in{" "}
          <span className="text-[var(--primary)]">one cook day</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Plan meals, generate grocery lists, and batch cook like a pro. Save
          time, eat better, and hit your nutrition goals every week.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] font-medium text-lg hover:bg-[var(--muted)] transition-colors"
          >
            Browse recipes
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for stress-free meal prep
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[var(--card)] rounded-xl p-6 shadow-sm border border-[var(--border)]"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--primary)]/10 mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[var(--muted-foreground)] mb-12 max-w-xl mx-auto">
            Start free, upgrade when you need AI-powered plans and unlimited
            recipes.
          </p>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                features: [
                  "1 saved meal plan",
                  "20 recipes",
                  "Basic grocery list",
                ],
              },
              {
                name: "Pro",
                price: "$9.99",
                features: [
                  "Unlimited plans",
                  "Full recipe library",
                  "AI meal generation",
                  "PDF export",
                  "Macro tracking",
                ],
                highlighted: true,
              },
              {
                name: "Family",
                price: "$14.99",
                features: [
                  "Up to 6 profiles",
                  "Shared grocery list",
                  "Auto-scaling servings",
                  "All Pro features",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 border text-left ${
                  plan.highlighted
                    ? "border-[var(--primary)] shadow-lg ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--border)]"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && (
                    <span className="text-[var(--muted-foreground)]">/mo</span>
                  )}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                    >
                      <span className="text-[var(--primary)] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                      : "border border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-auto">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <ChefHat className="h-5 w-5" />
            <span>© 2026 Batch Cook. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--muted-foreground)]">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
