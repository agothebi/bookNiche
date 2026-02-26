-- =============================================
-- BookNiche: SavedBook table + RLS
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================

-- Table: saved_books (wishlist items per user)
create table if not exists public.saved_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  description text not null,
  match_reason text not null,
  genres text[] not null default '{}',
  saved_at timestamptz not null default now(),

  -- Prevent duplicate saves: one row per (user_id, title, author)
  unique (user_id, title, author)
);

-- Index for fast lookups by user
create index if not exists saved_books_user_id_idx on public.saved_books (user_id);

-- Row Level Security (RLS)
alter table public.saved_books enable row level security;

-- Users can only read/insert/delete their own saved books
create policy "Users can view own saved books"
  on public.saved_books for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved books"
  on public.saved_books for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved books"
  on public.saved_books for delete
  using (auth.uid() = user_id);

-- Optional: allow update (e.g. reorder or notes later)
create policy "Users can update own saved books"
  on public.saved_books for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- TypeScript-friendly column names:
-- id, user_id, title, author, description,
-- match_reason, genres (text[]), saved_at
-- =============================================
