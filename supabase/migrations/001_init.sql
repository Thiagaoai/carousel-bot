-- carousel-bot: initial schema
-- Run this in Supabase SQL editor (or via `supabase db push` with CLI).

create table if not exists carousel_jobs (
  id          uuid primary key default gen_random_uuid(),

  -- Telegram identity
  user_id     text not null,
  username    text,
  chat_id     text,

  -- Input
  brief       text not null,
  style       text default 'cinematico',

  -- Lifecycle
  status      text not null default 'researching',
  -- researching → prompts_ready → generating_images → awaiting_approval
  -- → posting → posted
  -- or: rejected | failed (terminal)

  -- Generated artifacts (jsonb so the shape can evolve without migrations)
  research_data  jsonb,    -- { cards, image_prompts, caption, research }
  caption        text,

  -- Instagram result
  postforme_response jsonb,
  instagram_permalink text,

  -- Error tracking
  error_message text,

  -- Timestamps
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  posted_at   timestamptz,

  constraint carousel_jobs_status_chk check (status in (
    'researching',
    'prompts_ready',
    'generating_images',
    'awaiting_approval',
    'posting',
    'posted',
    'rejected',
    'failed'
  ))
);

create index if not exists carousel_jobs_user_created_idx
  on carousel_jobs (user_id, created_at desc);

create index if not exists carousel_jobs_status_idx
  on carousel_jobs (status);

-- updated_at trigger
-- set search_path = '' hardens against search_path hijacking (Supabase advisor 0011)
create or replace function carousel_jobs_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists carousel_jobs_updated_at on carousel_jobs;
create trigger carousel_jobs_updated_at
  before update on carousel_jobs
  for each row execute function carousel_jobs_set_updated_at();
