# Batch Cook

A SaaS application for batch cooking and weekly meal prep planning. Create dietary profiles, browse recipes, generate AI-powered weekly meal plans, and get auto-generated grocery checklists.

## Screenshots

<!-- Add screenshots here -->

## Features

- **Dietary Profiles** — Set dietary preferences, allergies, household size, and cooking skill level
- **Recipe Library** — Browse, search, and filter a curated collection of batch-friendly recipes
- **Weekly Meal Plans** — AI-generated meal plans tailored to your dietary profile (Mon-Sun, all meals)
- **Grocery Checklists** — Auto-generated shopping lists grouped by category with consolidated quantities
- **Subscription Plans** — Free, Pro, and Family tiers via Stripe
- **Google OAuth** — Sign in with your Google account

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Google OAuth) |
| AI | Anthropic Claude SDK |
| Payments | Stripe |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand + TanStack React Query |
| Validation | Zod |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** (local or hosted)
- **npm**

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd batch-cook-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and fill in your real values. See the Environment Variables section below.

4. **Push the database schema**

   ```bash
   npx prisma db push
   ```

5. **Seed the database**

   ```bash
   npx prisma db seed
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App base URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for AI meal plan generation |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (client-side) |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Yes | Stripe price ID for Pro subscription |
| `NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID` | Yes | Stripe price ID for Family subscription |

## Project Structure

```
src/
  app/              # Next.js App Router pages and layouts
  config/           # App configuration (subscription plans, etc.)
  hooks/            # Custom React hooks
  lib/              # Shared utilities (db client, Anthropic, Stripe, helpers)
prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed data script
public/             # Static assets
tasks/              # Task tracking and lessons learned
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the project code conventions (see `CLAUDE.md`)
3. Ensure TypeScript compiles without errors (`npm run build`)
4. Run the linter (`npm run lint`)
5. Open a pull request with a clear description of what changed and why
