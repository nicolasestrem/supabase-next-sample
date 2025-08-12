create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "users read own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "users insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);
