-- ============================================================
--  Migration 001 — Séjours multi-personnes & multi-maisons
--  À exécuter UNE FOIS dans Supabase → SQL Editor → Run
--  (uniquement si tu as déjà lancé schema.sql AVANT cette mise à jour)
--  Sans danger : peut être relancée plusieurs fois.
-- ============================================================

-- Nouvelles colonnes
alter table stays add column if not exists maisons text[] not null default '{}';
alter table stays add column if not exists member_ids uuid[] not null default '{}';
alter table stays add column if not exists extra_guests text[] not null default '{}';

-- Reprise des anciennes données si elles existent
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'stays' and column_name = 'maison') then
    update stays set maisons = array[maison]::text[]
      where maison is not null and (maisons is null or maisons = '{}');
  end if;

  if exists (select 1 from information_schema.columns
             where table_name = 'stays' and column_name = 'guest_names') then
    update stays set extra_guests = guest_names
      where guest_names is not null and (extra_guests is null or extra_guests = '{}');
  end if;
end $$;

-- Inclure l'organisateur comme participant par défaut
update stays set member_ids = array[profile_id]
  where member_ids is null or member_ids = '{}';

-- Suppression des anciennes colonnes
alter table stays drop column if exists maison;
alter table stays drop column if exists guest_count;
alter table stays drop column if exists guest_names;
