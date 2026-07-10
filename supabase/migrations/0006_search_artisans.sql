-- ============================================================================
-- Migration 0006 — Fonction de recherche avec matching de zone de couverture
-- Centralise la logique décrite en commentaire dans 0005_zone_couverture.sql :
-- un artisan apparaît pour une ville donnée s'il couvre tout son canton de
-- base, ou s'il a explicitement ajouté cette ville à sa zone de couverture.
-- Sans ville précisée, la recherche par canton seul inclut aussi les
-- artisans dont la zone de couverture touche ce canton (même si leur canton
-- de base est différent).
-- ============================================================================

create or replace function public.search_artisans(
  p_metier text default null,
  p_canton text default null,
  p_ville_id uuid default null
)
returns setof public.artisans
language sql
stable
as $$
  select distinct a.*
  from public.artisans a
  where a.valide = true
    and a.compte_actif = true
    and (p_metier is null or a.metier = p_metier)
    and (
      p_canton is null
      or a.canton = p_canton
      or exists (
        select 1 from public.artisan_villes av
        join public.villes v on v.id = av.ville_id
        where av.artisan_id = a.id and v.canton_code = p_canton
      )
    )
    and (
      p_ville_id is null
      or (
        a.couverture_canton_entier
        and a.canton = (select v.canton_code from public.villes v where v.id = p_ville_id)
      )
      or exists (
        select 1 from public.artisan_villes av
        where av.artisan_id = a.id and av.ville_id = p_ville_id
      )
    );
$$;

grant execute on function public.search_artisans(text, text, uuid) to anon, authenticated;
