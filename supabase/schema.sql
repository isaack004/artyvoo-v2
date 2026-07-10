-- ============================================================================
-- Artyvoo — Schéma de base de données Supabase (PostgreSQL)
-- Plateforme de mise en relation particuliers / artisans (Suisse romande)
--
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================================

-- Extensions utiles
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('particulier', 'artisan', 'admin');

create type metier as enum ('plombier', 'electricien', 'serrurier', 'chauffagiste', 'jardinier');

create type canton_code as enum ('GE', 'VD', 'JU', 'BE', 'VS');

create type statut_rdv as enum ('en_attente', 'confirme', 'annule', 'termine');

-- ----------------------------------------------------------------------------
-- profiles : étend auth.users (créé automatiquement par Supabase Auth)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'particulier',
  prenom text,
  nom text,
  telephone text,
  created_at timestamptz not null default now()
);

-- Crée automatiquement une ligne profiles à l'inscription d'un utilisateur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, prenom, nom)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'particulier'),
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- artisans : fiche entreprise, une par profil "artisan"
-- ----------------------------------------------------------------------------
create table if not exists public.artisans (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  entreprise text not null,
  metier metier not null,
  canton canton_code not null,
  ville text not null,
  adresse text not null,
  bio text,
  telephone text,
  email text,
  annees_experience int default 0,
  urgence_disponible boolean not null default false,
  photo_url text,
  valide boolean not null default false, -- validation manuelle avant publication
  created_at timestamptz not null default now()
);

create index if not exists idx_artisans_metier_canton on public.artisans (metier, canton);

-- ----------------------------------------------------------------------------
-- services : prestations proposées par un artisan
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  nom text not null,
  description text,
  duree_minutes int not null default 30,
  prix_chf numeric(10, 2) not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- disponibilites : règles hebdomadaires récurrentes (agenda de base)
-- ----------------------------------------------------------------------------
create table if not exists public.disponibilites (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  jour_semaine int not null check (jour_semaine between 0 and 6), -- 0 = lundi
  heure_debut time not null,
  heure_fin time not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- indisponibilites : congés / exceptions ponctuelles
-- ----------------------------------------------------------------------------
create table if not exists public.indisponibilites (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  date date not null,
  heure_debut time,
  heure_fin time,
  toute_la_journee boolean not null default true
);

-- ----------------------------------------------------------------------------
-- appointments : rendez-vous pris par les particuliers
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  service_id uuid not null references public.services (id),
  client_id uuid references public.profiles (id), -- null si réservation sans compte
  client_nom text not null,
  client_email text not null,
  client_telephone text not null,
  adresse_intervention text not null,
  date date not null,
  heure time not null,
  statut statut_rdv not null default 'en_attente',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_artisan_date on public.appointments (artisan_id, date);

-- ----------------------------------------------------------------------------
-- avis : évaluations laissées après un rendez-vous terminé
-- ----------------------------------------------------------------------------
create table if not exists public.avis (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  client_id uuid references public.profiles (id),
  note int not null check (note between 1 and 5),
  commentaire text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.artisans enable row level security;
alter table public.services enable row level security;
alter table public.disponibilites enable row level security;
alter table public.indisponibilites enable row level security;
alter table public.appointments enable row level security;
alter table public.avis enable row level security;

-- profiles : chacun voit/modifie uniquement son propre profil
create policy "profiles: lecture de son profil" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: modification de son profil" on public.profiles
  for update using (auth.uid() = id);

-- artisans : fiches validées visibles publiquement, artisan gère la sienne
create policy "artisans: lecture publique des fiches validées" on public.artisans
  for select using (valide = true);
create policy "artisans: lecture de sa propre fiche" on public.artisans
  for select using (auth.uid() = profile_id);
create policy "artisans: creation de sa fiche" on public.artisans
  for insert with check (auth.uid() = profile_id);
create policy "artisans: modification de sa fiche" on public.artisans
  for update using (auth.uid() = profile_id);

-- services : visibles publiquement si l'artisan est validé, gérés par l'artisan
create policy "services: lecture publique" on public.services
  for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.valide = true)
  );
create policy "services: gestion par l'artisan proprietaire" on public.services
  for all using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

-- disponibilites / indisponibilites : lecture publique, gestion par le propriétaire
create policy "disponibilites: lecture publique" on public.disponibilites
  for select using (true);
create policy "disponibilites: gestion par l'artisan proprietaire" on public.disponibilites
  for all using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

create policy "indisponibilites: lecture publique" on public.indisponibilites
  for select using (true);
create policy "indisponibilites: gestion par l'artisan proprietaire" on public.indisponibilites
  for all using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

-- appointments : le client voit ses RDV, l'artisan voit les siens
create policy "appointments: creation publique (prise de RDV)" on public.appointments
  for insert with check (true);
create policy "appointments: lecture par le client" on public.appointments
  for select using (auth.uid() = client_id);
create policy "appointments: lecture par l'artisan" on public.appointments
  for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );
create policy "appointments: mise a jour par l'artisan" on public.appointments
  for update using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.profile_id = auth.uid())
  );

-- avis : lecture publique, création par le client concerné
create policy "avis: lecture publique" on public.avis
  for select using (true);
create policy "avis: creation par le client du rendez-vous" on public.avis
  for insert with check (auth.uid() = client_id);

-- ============================================================================
-- Fin du script
-- ============================================================================
