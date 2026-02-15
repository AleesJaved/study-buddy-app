-- User timer state: persists where the user left off in their Pomodoro session
create table if not exists public.user_timer_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null default 'work',
  time_remaining integer not null default 1500,
  total_time integer not null default 1500,
  status text not null default 'idle',
  current_session integer not null default 1,
  completed_sessions integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Enable Row Level Security
alter table public.user_timer_state enable row level security;

-- Users can only read their own timer state
create policy "Users can read own timer state"
  on public.user_timer_state for select
  using (auth.uid() = user_id);

-- Users can insert their own timer state
create policy "Users can insert own timer state"
  on public.user_timer_state for insert
  with check (auth.uid() = user_id);

-- Users can update their own timer state
create policy "Users can update own timer state"
  on public.user_timer_state for update
  using (auth.uid() = user_id);

-- Auto-update updated_at on changes
create trigger on_user_timer_state_updated
  before update on public.user_timer_state
  for each row execute function public.handle_updated_at();
