-- ============================================================================
-- Migration 0007 — Pay-per-lead (alternative sans engagement à l'abonnement)
-- Un artisan peut activer le paiement au lead (18 CHF/lead) plutôt que de
-- s'abonner : compte_actif reste toujours true, chaque nouveau lead
-- au-delà du quota gratuit est facturé via un moyen de paiement enregistré
-- (Stripe SetupIntent côté espace-pro/abonnement, cf. /api/stripe/*).
-- ============================================================================

alter table public.artisans
  add column if not exists pay_per_lead_enabled boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text;

comment on column public.artisans.pay_per_lead_enabled is
  'true = pas de blocage par quota gratuit, chaque lead au-delà de 5 est facturé 18 CHF via stripe_payment_method_id';
comment on column public.artisans.stripe_customer_id is
  'Client Stripe de l''artisan, utilisé pour les abonnements et le paiement au lead';
comment on column public.artisans.stripe_payment_method_id is
  'Moyen de paiement enregistré (SetupIntent) pour les charges hors-session en mode pay-per-lead';
