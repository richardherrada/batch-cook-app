@AGENTS.md

# Batch Cook — Project Guide

## Overview

Batch Cook is a SaaS application for batch cooking and weekly meal prep planning. Users create dietary profiles, browse a recipe library, generate weekly meal plans, and get auto-generated grocery checklists. AI-powered meal plan suggestions are provided via the Anthropic API, and subscriptions are handled through Stripe.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Google OAuth)
- **AI:** Anthropic Claude SDK
- **Payments:** Stripe
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** Zustand + TanStack React Query
- **Validation:** Zod

## Running Locally

```bash
# Install dependencies
npm install

# Push the Prisma schema to the database
npx prisma db push

# Seed the database with sample data
npx prisma db seed

# Start the dev server
npm run dev
```

The app runs at http://localhost:3000.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. See the table below for each variable:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App base URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI features |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID` | Stripe price ID for Family plan |

## Project Structure

```
src/
  app/              # Next.js App Router pages and layouts
  config/           # App configuration (subscription plans, etc.)
  hooks/            # Custom React hooks
  lib/              # Shared utilities (db client, Anthropic, Stripe, helpers)
prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed data script (when created)
public/             # Static assets
tasks/              # Task tracking and lessons learned
```

## Code Conventions

- **TypeScript strict mode** is enabled. Do not use `any` unless absolutely necessary.
- **Zod validation** is required on all API route request bodies and query params.
- **Tailwind CSS + shadcn/ui** for all styling. No custom CSS files unless unavoidable.
- **Mobile-first** responsive design. Start with small screens and scale up.
- Use the App Router (`src/app/`) for all routing. No Pages Router.
- Prisma client is instantiated in `src/lib/db.ts` — always import from there.
- Keep components small and composable. Extract shared UI into `src/components/ui/`.
