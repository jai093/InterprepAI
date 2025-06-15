
-- 1. Table for assessments created by HR
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references recruiters(id) on delete cascade,
  title text not null,
  description text,
  questions jsonb not null, -- flexible format for questions
  created_at timestamp with time zone default now()
);

-- Enable RLS and allow only the recruiter to manage their assessments
alter table public.assessments enable row level security;

create policy "Recruiter can manage own assessments"
  on public.assessments
  for all
  using (recruiter_id = auth.uid());

-- 2. Table for assessment invitations (mapping candidate to assessment)
create table public.assessment_invites (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  recruiter_id uuid not null references recruiters(id) on delete cascade,
  candidate_id uuid not null references profiles(id) on delete cascade,
  link text, -- link to the assessment/interview simulation page
  status text default 'sent', -- sent, completed
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- RLS: recruiter can insert/select; candidate can view theirs
alter table public.assessment_invites enable row level security;

create policy "Recruiter can manage their invites"
  on public.assessment_invites
  for all
  using (recruiter_id = auth.uid());

create policy "Candidate can view their invites"
  on public.assessment_invites
  for select
  using (candidate_id = auth.uid());
  
-- 3. Table for assessment submissions
create table public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references assessment_invites(id) on delete cascade,
  candidate_id uuid not null references profiles(id) on delete cascade,
  responses jsonb not null,
  feedback text,
  completed_at timestamp with time zone default now()
);

-- RLS: recruiter who created invite & candidate
alter table public.assessment_submissions enable row level security;

create policy "Recruiter can view all submissions for their invites"
  on public.assessment_submissions
  for select
  using (
    (select recruiter_id from assessment_invites where id = invite_id) = auth.uid()
    or candidate_id = auth.uid()
  );
