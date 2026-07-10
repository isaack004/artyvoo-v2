-- ============================================================================
-- Migration 0003 — Monétisation freemium (abonnements + paiement au lead)
-- Pas de commission sur les prestations : facturation via Stripe uniquement.
-- ============================================================================

create type plan_abonnement as enum ('starter', 'pro', 'business');

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  plan plan_abonnement,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  statut text not null default 'active', -- active | past_due | canceled
  periode_fin timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_artisan on public.subscriptions (artisan_id);

create table if not exists public.leads_paid (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  appointment_id uuid references public.appointments (id),
  stripe_payment_intent_id text not null,
  montant_chf numeric(10, 2) not null default 18,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_paid_artisan on public.leads_paid (artisan_id);

-- ----------------------------------------------------------------------------
-- RLS : ces tables ne sont écrites que par les routes serveur Stripe
-- (webhook, checkout) avec la clé service-role — jamais depuis le client.
-- Lecture : l'artisan propriétaire, et l'admin (policy ajoutée en 0004).
-- ----------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.leads_paid enable row level security;

create policy "subscriptions: lecture par l'artisan proprietaire" on public.subscriptions
  for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

create policy "leads_paid: lecture par l'artisan proprietaire" on public.leads_paid
  for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );
