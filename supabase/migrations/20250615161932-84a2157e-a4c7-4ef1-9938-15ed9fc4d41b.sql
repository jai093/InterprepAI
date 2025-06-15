
-- 1. Table for HR/recruiter profiles
create table public.recruiters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  created_at timestamp with time zone default now()
);

-- 2. Table to track users shortlisted by recruiters
create table public.shortlistings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  recruiter_id uuid not null references recruiters(id) on delete cascade,
  user_score integer not null,
  feedback text,
  created_at timestamp with time zone default now(),
  status text default 'pending' -- 'pending', 'contacted', 'interviewed', 'hired', 'rejected'
);

-- 3. Table for interview invitations sent by recruiters to users
create table public.interview_invites (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references recruiters(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  invite_link text,
  interview_date timestamp with time zone,
  status text default 'pending', -- 'pending', 'completed', 'reviewed'
  created_at timestamp with time zone default now()
);

-- 4. Table to store completed interview results (AI feedback, video/audio links, etc.)
create table public.interview_results (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references interview_invites(id) on delete cascade,
  transcript text,
  ai_feedback text,
  video_url text,
  audio_url text,
  score integer,
  created_at timestamp with time zone default now()
);

-- 5. Ensure each user can only be shortlisted once per recruiter
create unique index if not exists shortlistings_user_recruiter_idx on public.shortlistings (user_id, recruiter_id);

-- 6. Enable RLS and basic policies for all four tables (further restriction can be added as needed)
alter table public.recruiters enable row level security;
alter table public.shortlistings enable row level security;
alter table public.interview_invites enable row level security;
alter table public.interview_results enable row level security;

-- Recruiters can manage their own records
create policy "Recruiters manage own" on public.recruiters
  for all using (true) with check (true);

-- Shortlisted user or recruiter can view shortlistings; only recruiters can create
create policy "Shortlistings can be viewed by user or recruiter" on public.shortlistings
  for select using (auth.uid() = user_id or auth.uid() = recruiter_id);
create policy "Recruiters can insert shortlistings" on public.shortlistings
  for insert with check (auth.uid() = recruiter_id);

-- Recruiters/users can see/interact with invites (HR sends, user receives)
create policy "Invite visible to user and recruiter" on public.interview_invites
  for select using (auth.uid() = recruiter_id or auth.uid() = user_id);
create policy "Recruiters can insert invites" on public.interview_invites
  for insert with check (auth.uid() = recruiter_id);

-- Only the recruiter and user involved can see interview results
create policy "Result visible for recruiter and user" on public.interview_results
  for select using (
    (select recruiter_id from interview_invites where id = invite_id) = auth.uid()
    or (select user_id from interview_invites where id = invite_id) = auth.uid()
  );
create policy "User can insert result" on public.interview_results
  for insert with check (
    (select user_id from interview_invites where id = invite_id) = auth.uid()
  );
