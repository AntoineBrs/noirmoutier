-- ============================================================
--  Migration 002 — Date de photo (tri par année et par mois)
--  À exécuter UNE FOIS dans Supabase → SQL Editor → Run.
--  Sans danger : peut être relancée plusieurs fois.
-- ============================================================

-- Nouvelles colonnes
alter table photos add column if not exists photo_date date;
alter table photos add column if not exists photo_year int;

-- Reprise des photos existantes : on utilise la date de mise en ligne
update photos set photo_date = created_at::date where photo_date is null;
update photos set photo_year = extract(year from created_at)::int
  where photo_year is null;

-- L'année devient obligatoire (avec une valeur par défaut pour les futurs ajouts)
alter table photos alter column photo_year set default extract(year from now())::int;
alter table photos alter column photo_year set not null;
