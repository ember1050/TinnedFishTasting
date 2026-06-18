# Tinned Fish Tasting

Rate, rank, and review tinned fish. Host blind tastings with friends.

## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Hosting:** Vercel

## Getting Started

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/ember1050/TinnedFishTasting.git
cd TinnedFishTasting
npm install
```

2. Create a Supabase project at [supabase.com](https://supabase.com) and run the migrations in `supabase/migrations/` in order.

3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
└── lib/          # Utilities, Supabase clients, types
supabase/
└── migrations/   # SQL migration files (version-controlled schema)
```

## Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:

1. `001_fish.sql` — Fish product catalog
2. `002_profiles.sql` — User profiles with RLS
3. `003_reviews.sql` — Review system with RLS
4. `004_tastings.sql` — Tasting events, participants, blind responses

