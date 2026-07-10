-- ============================================================================
-- Migration 0002 — Artisans : régions génériques + onboarding enrichi
-- Prérequis : 0001_regions.sql (tables cantons/villes déjà créées et seedées)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- canton : passage de l'enum canton_code (5 valeurs) à une FK texte vers
-- public.cantons (26 valeurs), pour ne plus jamais avoir à toucher au code
-- lors de l'ajout d'un canton.
-- ----------------------------------------------------------------------------
alter table public.artisans
  alter column canton type text using canton::text;

alter table public.artisans
  add constraint artisans_canton_fkey foreign key (canton) references public.cantons (code);

drop type if exists canton_code;

-- ----------------------------------------------------------------------------
-- Onboarding enrichi : identification entreprise + spécialités + suivi du
-- quota de rendez-vous gratuits (modèle freemium, cf. migration 0003)
-- ----------------------------------------------------------------------------
alter table public.artisans
  add column if not exists ide_number text,
  add column if not exists ide_verifie boolean not null default false,
  add column if not exists specialites text[] not null default '{}',
  add column if not exists leads_gratuits_utilises int not null default 0,
  add column if not exists compte_actif boolean not null default true;

comment on column public.artisans.ide_number is 'Numéro IDE suisse (format CHE-xxx.xxx.xxx), format validé côté app, vérification manuelle par l''admin avant activation (voir artisans.valide)';
comment on column public.artisans.specialites is 'Tags libres affichés sur la fiche publique, ex: urgences, dimanche, canalisation, installation';
comment on column public.artisans.leads_gratuits_utilises is 'Nombre de rendez-vous reçus ; au-delà de 5 sans abonnement actif ni pay-per-lead, compte_actif passe à false';
comment on column public.artisans.compte_actif is 'false = profil masqué des résultats de recherche tant qu''un abonnement ou paiement au lead n''est pas actif';
