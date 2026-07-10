-- ============================================================================
-- Migration 0005 — Zone de couverture artisan
-- L'artisan a un canton de base (artisans.canton) et une zone de couverture
-- pour les interventions, choisie à l'inscription :
--   - soit une liste de villes précises (table artisan_villes, many-to-many)
--   - soit "tout le canton" en un clic (artisans.couverture_canton_entier)
-- Prérequis : 0001_regions.sql (table villes), 0002_artisans_onboarding.sql
-- ============================================================================

alter table public.artisans
  add column if not exists couverture_canton_entier boolean not null default false;

comment on column public.artisans.couverture_canton_entier is
  'true = l''artisan intervient partout dans son canton de base (artisans.canton) ; la liste artisan_villes est alors ignorée pour le matching';

create table if not exists public.artisan_villes (
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  ville_id uuid not null references public.villes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artisan_id, ville_id)
);

create index if not exists idx_artisan_villes_ville on public.artisan_villes (ville_id);

comment on table public.artisan_villes is
  'Zone de couverture par villes précises, utilisée pour le matching quand couverture_canton_entier = false';

alter table public.artisan_villes enable row level security;

create policy "artisan_villes: lecture publique" on public.artisan_villes
  for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.valide = true)
  );
create policy "artisan_villes: gestion par l'artisan proprietaire" on public.artisan_villes
  for all using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Requête de matching de référence (à utiliser dans searchArtisans une fois
-- la recherche réelle branchée sur Supabase — voir section 8 du plan) :
--
-- select distinct a.*
-- from public.artisans a
-- where a.metier = :metier
--   and a.valide = true
--   and a.compte_actif = true
--   and (
--     (a.canton = :canton_code and a.couverture_canton_entier = true)
--     or exists (
--       select 1 from public.artisan_villes av
--       where av.artisan_id = a.id and av.ville_id = :ville_id
--     )
--   );
-- ----------------------------------------------------------------------------
