-- ============================================================================
-- Migration 0004 — Accès admin transverse (dashboard /admin)
-- Le rôle 'admin' existe déjà dans user_role (schema.sql initial) ; ces
-- policies donnent au rôle admin une lecture complète pour les statistiques
-- et la modération des artisans en attente de validation.
--
-- is_admin() est en security definer pour éviter la récursion RLS : une
-- policy sur `profiles` qui interroge `profiles` directement entrerait en
-- boucle infinie, puisque la sous-requête serait elle-même soumise à RLS.
-- ============================================================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create policy "admin: lecture totale profiles" on public.profiles
  for select using (public.is_admin());

create policy "admin: lecture totale artisans" on public.artisans
  for select using (public.is_admin());
create policy "admin: modification artisans (validation)" on public.artisans
  for update using (public.is_admin());

create policy "admin: lecture totale appointments" on public.appointments
  for select using (public.is_admin());

create policy "admin: lecture totale subscriptions" on public.subscriptions
  for select using (public.is_admin());

create policy "admin: lecture totale leads_paid" on public.leads_paid
  for select using (public.is_admin());
