-- ============================================================
--  Noirmoutier — Schéma de la base de données (Supabase)
--  À coller dans Supabase → SQL Editor → Run, une seule fois.
-- ============================================================

-- 1) PROFILS (les membres de la famille, façon Netflix)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) SÉJOURS
create table if not exists stays (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  maison text not null check (maison in ('sud', 'nord', 'annexe')),
  arrival date not null,
  departure date not null,
  guest_count int not null default 1,
  guest_names text[] default '{}',
  note text,
  created_at timestamptz not null default now()
);

-- 3) PHOTOS
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in ('noirmoutier', 'famille', 'quotidien')),
  image_url text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================
--  Sécurité : site familial de confiance, sans mot de passe.
--  On autorise la lecture et l'écriture publiques (clé anon).
-- ============================================================
alter table profiles enable row level security;
alter table stays    enable row level security;
alter table photos   enable row level security;

-- Tout le monde peut lire et écrire (modèle de confiance familiale)
drop policy if exists "ouvert profiles" on profiles;
create policy "ouvert profiles" on profiles for all using (true) with check (true);

drop policy if exists "ouvert stays" on stays;
create policy "ouvert stays" on stays for all using (true) with check (true);

drop policy if exists "ouvert photos" on photos;
create policy "ouvert photos" on photos for all using (true) with check (true);

-- ============================================================
--  Pré-remplissage des 14 profils de la famille
-- ============================================================
insert into profiles (name, sort_order)
select v.name, v.ord
from (values
  ('Adrien', 0), ('Antoine', 1), ('Eloi', 2), ('Alice', 3),
  ('Simon', 4), ('Chloé', 5), ('Samuel', 6), ('Florence', 7),
  ('Jeanne', 8), ('Michel', 9), ('Guillaume', 10), ('Mélanie', 11),
  ('Thomas', 12), ('Mamie', 13)
) as v(name, ord)
where not exists (select 1 from profiles);

-- ============================================================
--  STORAGE : deux espaces publics pour les images
--  (À créer aussi via l'interface Storage si besoin, mais ceci suffit)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Autoriser l'upload / lecture publics sur ces deux buckets
drop policy if exists "images lisibles" on storage.objects;
create policy "images lisibles" on storage.objects
  for select using (bucket_id in ('photos', 'avatars'));

drop policy if exists "images televersables" on storage.objects;
create policy "images televersables" on storage.objects
  for insert with check (bucket_id in ('photos', 'avatars'));

drop policy if exists "images supprimables" on storage.objects;
create policy "images supprimables" on storage.objects
  for delete using (bucket_id in ('photos', 'avatars'));
