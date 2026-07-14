-- ============================================================================
-- Migration 0009 — Corrige handle_new_user() : "type user_role does not exist"
-- Le cast ::user_role échouait avec l'erreur Postgres 42704 car le
-- search_path de la fonction ne pointait pas vers le schéma public,
-- bloquant toute inscription ("Database error saving new user"). Fix :
-- cast qualifié ::public.user_role + search_path épinglé sur la fonction
-- (recommandé par Supabase pour toute fonction security definer).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, prenom, nom)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'particulier'),
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
