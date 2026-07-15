-- Chowa database schema
-- Run this in the Supabase SQL editor.

-- Users (Supabase auth.users is the source of truth; this extends it)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  subscription_tier text not null default 'free', -- 'free' | 'plus'
  daily_step_goal int,
  goal text,                      -- 'recover' | 'maintain' | 'gain'
  goal_set_at timestamptz,
  goal_last_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Equipment: general categories + capability details in JSONB
create table equipment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,        -- 'pan' | 'appliance' | 'knife' | 'thermometer' | ...
  name text not null,            -- 'De Buyer Mineral B 11in'
  brand text,
  model text,
  capabilities jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Ingredient inventory (free text name, normalized by the LLM at generation time)
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,             -- '0.5-inch thick ribeye'
  category text,                  -- 'protein' | 'produce' | 'dairy' | 'pantry'
  quantity numeric,
  unit text,
  storage_location text,          -- 'fridge' | 'freezer' | 'pantry'
  frozen boolean not null default false,
  date_added date not null default current_date,
  estimated_expiry date,
  notes text,
  created_at timestamptz not null default now()
);

-- Activity logs, drive the "digital nutritionist" recommendations
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  activity_level text not null,   -- 'heavy_workout' | 'active_light' | 'sedentary'
  activity_type text,             -- 'lifting' | 'bouldering' | 'cardio' | null
  notes text
);

-- Generated recipes/instructions (cache + history)
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  time_constraint_min int,
  equipment_used uuid[] default '{}',
  ingredients_used jsonb not null,
  instructions jsonb not null,
  activity_context text,
  macro_estimate jsonb,
  created_at timestamptz not null default now()
);

-- Cook sessions: actual usage of a recipe
create table cook_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  rating int check (rating between 1 and 5)
);

-- Subscription/plan history
create table subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_type text not null,   -- 'trial_start' | 'upgrade' | 'downgrade' | 'cancel'
  tier text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb
);

-- Row-level security: users can only touch their own rows
alter table profiles enable row level security;
alter table equipment enable row level security;
alter table ingredients enable row level security;
alter table activity_logs enable row level security;
alter table recipes enable row level security;
alter table cook_sessions enable row level security;
alter table subscription_events enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own equipment" on equipment for all using (auth.uid() = user_id);
create policy "own ingredients" on ingredients for all using (auth.uid() = user_id);
create policy "own activity logs" on activity_logs for all using (auth.uid() = user_id);
create policy "own recipes" on recipes for all using (auth.uid() = user_id);
create policy "own cook sessions" on cook_sessions for all using (auth.uid() = user_id);
create policy "own subscription events" on subscription_events for all using (auth.uid() = user_id);
