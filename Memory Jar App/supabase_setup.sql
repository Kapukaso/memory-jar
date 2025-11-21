-- Create the memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  text text,
  date text,
  image_url text,
  audio_url text,
  tags text[],
  jar_id text not null
);

-- Enable Row Level Security (RLS)
alter table memories enable row level security;

-- Create a policy to allow anyone to read/write (since we are using a shared jar_id for "auth" for now)
-- In a real app with user auth, you'd check auth.uid()
create policy "Enable read access for all users" on memories for select using (true);
create policy "Enable insert access for all users" on memories for insert with check (true);
create policy "Enable update access for all users" on memories for update using (true);
create policy "Enable delete access for all users" on memories for delete using (true);

-- Create a storage bucket for media
insert into storage.buckets (id, name, public) values ('media', 'media', true);

-- Set up storage policies
create policy "Give public access to media" on storage.objects for select using ( bucket_id = 'media' );
create policy "Enable upload access for all users" on storage.objects for insert with check ( bucket_id = 'media' );
