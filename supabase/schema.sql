-- OneP starter schema for Supabase. Review and run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text,
  status text not null default 'available' check (status in ('available','sold','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  position int not null default 0 check (position between 0 and 1),
  created_at timestamptz not null default now(),
  unique (post_id, position)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references public.profiles(id) on delete cascade,
  participant_two uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participant_one <> participant_two),
  check (participant_one < participant_two),
  unique (participant_one, participant_two)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists messages_chat_created_idx on public.messages(chat_id, created_at);

-- Automatically create a profile when a new Auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.follows enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can insert their profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Available products are publicly readable" on public.products for select using (status = 'available' or seller_id = auth.uid());
create policy "Sellers can create products" on public.products for insert to authenticated with check (seller_id = auth.uid());
create policy "Sellers can update products" on public.products for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "Sellers can delete products" on public.products for delete to authenticated using (seller_id = auth.uid());

create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Users can create their posts" on public.posts for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update their posts" on public.posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete their posts" on public.posts for delete to authenticated using (user_id = auth.uid());

create policy "Post images are publicly readable" on public.post_images for select using (true);
create policy "Post owners can add images" on public.post_images for insert to authenticated with check (exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));
create policy "Post owners can delete images" on public.post_images for delete to authenticated using (exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));

create policy "Follows are publicly readable" on public.follows for select using (true);
create policy "Users can follow as themselves" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "Users can unfollow as themselves" on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy "Chat participants can read chats" on public.chats for select to authenticated using (auth.uid() = participant_one or auth.uid() = participant_two);
create policy "Participants can create chats" on public.chats for insert to authenticated with check (auth.uid() = participant_one or auth.uid() = participant_two);
create policy "Chat participants can read messages" on public.messages for select to authenticated using (exists (select 1 from public.chats c where c.id = chat_id and (c.participant_one = auth.uid() or c.participant_two = auth.uid())));
create policy "Chat participants can send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.chats c where c.id = chat_id and (c.participant_one = auth.uid() or c.participant_two = auth.uid())));

-- Create a public bucket for post photos. For private media, use a private bucket and signed URLs instead.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "Post photos are publicly readable" on storage.objects for select using (bucket_id = 'post-images');
create policy "Signed-in users can upload to their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update their own photos" on storage.objects for update to authenticated using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own photos" on storage.objects for delete to authenticated using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
