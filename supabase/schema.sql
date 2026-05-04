-- BeEnhanced AI Assistant — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Chat logs table
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  context text not null default 'general',
  is_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists chat_logs_created_at_idx on chat_logs (created_at desc);
create index if not exists chat_logs_role_idx on chat_logs (role);
create index if not exists chat_logs_flagged_idx on chat_logs (is_flagged) where is_flagged = true;

-- Admin settings table (single row, id = 'main')
create table if not exists admin_settings (
  id text primary key default 'main',
  additional_restrictions text not null default '',
  access_revoked boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Insert default settings row if not exists
insert into admin_settings (id, additional_restrictions, access_revoked, updated_at)
values ('main', '', false, now())
on conflict (id) do nothing;

-- Row Level Security
-- Since we use the service role key server-side only, we lock down all client access
alter table chat_logs enable row level security;
alter table admin_settings enable row level security;

-- No public access — service role bypasses RLS
create policy "No public access" on chat_logs for all using (false);
create policy "No public access" on admin_settings for all using (false);
