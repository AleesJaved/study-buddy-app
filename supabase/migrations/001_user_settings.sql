-- User settings table: stores Pomodoro settings per authenticated user
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_duration integer not null default 25,
  short_break_duration integer not null default 5,
  long_break_duration integer not null default 15,
  sessions_before_long_break integer not null default 4,
  auto_start_breaks boolean not null default false,
  auto_start_work boolean not null default false,
  sound_enabled boolean not null default true,
  vibration_enabled boolean not null default true,
  ticking_sound boolean not null default false,
  keep_screen_awake boolean not null default true,
  timer_color text not null default '#5BB8B0',
  break_color text not null default '#9B8EC4',
  background_preset text not null default 'lavender',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Enable Row Level Security
alter table public.user_settings enable row level security;

-- Users can only read their own settings
create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

-- Users can insert their own settings
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Users can update their own settings
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Auto-update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_settings_updated
  before update on public.user_settings
  for each row execute function public.handle_updated_at();
