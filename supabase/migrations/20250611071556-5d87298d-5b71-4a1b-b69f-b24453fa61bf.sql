
-- Create batch_call_sessions table for ElevenLabs integration
create table public.batch_call_sessions (
    id uuid primary key default gen_random_uuid(),
    candidate_id text not null,
    phone_number text not null,
    voice_id text not null,
    prompts text[] not null default '{}',
    audio_urls text[] not null default '{}',
    status text not null default 'ready',
    callback_url text,
    webhook_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- Enable RLS
alter table public.batch_call_sessions enable row level security;

-- Create policies for authenticated users
create policy "Users can view all batch call sessions" on public.batch_call_sessions
    for select using (auth.role() = 'authenticated');

create policy "Users can insert batch call sessions" on public.batch_call_sessions
    for insert with check (auth.role() = 'authenticated');

create policy "Users can update batch call sessions" on public.batch_call_sessions
    for update using (auth.role() = 'authenticated');

-- Create storage bucket for interview audio files
insert into storage.buckets (id, name, public)
values ('interview-audio', 'interview-audio', true);

-- Create storage policies
create policy "Public Access" on storage.objects
for select using (bucket_id = 'interview-audio');

create policy "Authenticated users can upload interview audio" on storage.objects
for insert with check (bucket_id = 'interview-audio' and auth.role() = 'authenticated');
