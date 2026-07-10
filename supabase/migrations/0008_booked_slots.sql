-- ============================================================================
-- Migration 0008 — Lecture publique des créneaux déjà pris (sans PII)
-- La table appointments n'a pas de policy RLS de lecture publique (clients et
-- artisans ne voient que leurs propres rendez-vous), donc le calcul des
-- disponibilités (src/lib/availability.ts) ne peut pas savoir quels créneaux
-- sont déjà occupés avec la clé anon. Cette fonction security definer expose
-- uniquement date + heure (aucune donnée personnelle) pour un artisan donné.
-- ============================================================================

create or replace function public.get_booked_slots(p_artisan_id uuid, p_from date, p_to date)
returns table(date date, heure time)
language sql
security definer
stable
as $$
  select date, heure
  from public.appointments
  where artisan_id = p_artisan_id
    and statut <> 'annule'
    and date between p_from and p_to;
$$;

grant execute on function public.get_booked_slots(uuid, date, date) to anon, authenticated;
