# Supabase plus Next.js sample

Simple auth and notes demo.

## Quick start

1. Install
```
npm i
```

2. Copy env file
```
cp .env.local.example .env.local
```

3. Fill these
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

4. Create table and policies in Supabase SQL editor
```
-- schema.sql contents below
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
```

5. Run
```
npm run dev
```

Open http://localhost:3000

## Tips

Set Site URL in Supabase Auth to your local url while you test.  
Turn on GitHub in Supabase if you want that login too.


## Deploy to Vercel

1. Push your project to GitHub.

2. In Vercel, import your repo and set these environment variables in project settings:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. (Optional) For GitHub Actions auto deploy, add these secrets in your GitHub repo:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

You can get them from Vercel dashboard under Account Settings > Tokens and in your project settings.

4. Every push to `main` will build and deploy.
## Deploy to Vercel

Two paths. Use the Git link in Vercel or use the workflow.

### Simple path with Git link

1. Push this repo to GitHub
2. In Vercel click New Project then Import from Git
3. Pick the repo
4. Set these env vars in Vercel Project Settings
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy

Docs
https://vercel.com/docs/deployments/git/vercel-for-github

### Workflow path with GitHub Actions

Set three repo secrets in GitHub
- VERCEL_TOKEN from your Vercel Account Settings
- VERCEL_ORG_ID from your Team or Account
- VERCEL_PROJECT_ID from the Vercel project

Where to find them
https://vercel.com/docs/deployments/overview#vercel-deployments-with-github-actions
https://vercel.com/docs/projects/environment-variables

Then push to main. The workflow builds and deploys to production.
