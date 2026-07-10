# Artyvoo — Plateforme de rendez-vous artisans (Suisse romande)

Site de mise en relation entre particuliers et artisans (plombier, électricien,
serrurier, chauffagiste, jardinier) avec prise de rendez-vous en ligne, dans le
style Doctolib / OneDoc. Couverture au lancement : **Genève, Vaud, Jura, Berne
(Jura bernois) et Valais**.

## Stack technique

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Postgres + Auth + Row Level Security) pour les données et les comptes
- Déploiement recommandé : **Vercel** (front) + **Supabase Cloud** (backend)

## État actuel du projet

Toutes les pages sont construites et fonctionnelles avec des **données de
démonstration** (`src/lib/mockData.ts`) pour que le site soit immédiatement
visualisable. Le schéma de base de données complet est prêt
(`supabase/schema.sql`). Il reste à :

1. Créer un projet Supabase et exécuter le schéma
2. Brancher les pages sur Supabase à la place des données de démo (voir les
   commentaires `// NOTE démo` / `// TODO` dans le code)
3. Personnaliser le nom définitif (voir section "Nom du site" ci-dessous)

## 1. Installation locale

Ce projet a été généré sans exécuter `npm install` (l'environnement de
génération n'a pas d'accès internet). Sur votre ordinateur :

```bash
cd rdv-artisans
npm install
npm run dev
```

Le site sera accessible sur http://localhost:3000

Prérequis : [Node.js](https://nodejs.org) version 18 ou plus récente.

## 2. Configuration Supabase

1. Créez un compte et un projet sur [supabase.com](https://supabase.com) (offre
   gratuite largement suffisante pour démarrer).
2. Dans **SQL Editor**, collez et exécutez le contenu de `supabase/schema.sql`.
   Cela crée toutes les tables (profils, artisans, services, disponibilités,
   rendez-vous, avis) avec la sécurité au niveau des lignes (RLS) déjà configurée.
3. Dans **Project Settings > API**, récupérez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (ne jamais exposer côté client)
4. Copiez `.env.example` vers `.env.local` et complétez les valeurs :

```bash
cp .env.example .env.local
```

5. Relancez `npm run dev`.

### Brancher les données réelles

Actuellement les pages lisent `src/lib/mockData.ts`. Pour passer aux données
réelles, remplacez ces imports par des requêtes Supabase, par exemple dans
`src/app/recherche/page.tsx` :

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const { data: artisans } = await supabase
  .from("artisans")
  .select("*, services(*)")
  .eq("valide", true)
  .eq("metier", metier);
```

Les fichiers `src/lib/supabase/client.ts` (composants `"use client"`) et
`src/lib/supabase/server.ts` (Server Components) sont déjà prêts à l'emploi.

## 3. Déploiement

### Option recommandée : Vercel

1. Poussez ce projet sur un dépôt GitHub/GitLab.
2. Sur [vercel.com](https://vercel.com), importez le dépôt.
3. Ajoutez les 3 variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) dans les
   réglages du projet Vercel.
4. Déployez — Vercel détecte automatiquement Next.js.

### Nom de domaine

Réservez un nom de domaine (ex. `artyvoo.ch` ou un nouveau nom) chez un
registraire suisse (Infomaniak, Hostpoint, Switch) et pointez-le vers Vercel.

## 4. Structure du projet

```
rdv-artisans/
├── supabase/schema.sql        # Schéma complet de la base de données
├── src/
│   ├── app/                   # Pages (App Router)
│   │   ├── page.tsx           # Accueil
│   │   ├── recherche/         # Résultats de recherche
│   │   ├── artisan/[id]/      # Fiche artisan
│   │   ├── rdv/[id]/          # Prise de rendez-vous (3 étapes)
│   │   ├── rdv/confirmation/  # Confirmation de RDV
│   │   ├── connexion/         # Connexion
│   │   ├── inscription/       # Inscription particulier / artisan
│   │   ├── devenir-artisan/   # Landing page pour recruter des artisans
│   │   ├── espace-pro/        # Dashboard artisan (agenda, services, dispos)
│   │   └── espace-client/     # Mes rendez-vous (particulier)
│   ├── components/            # Composants réutilisables
│   └── lib/
│       ├── constants.ts       # Cantons, villes, métiers
│       ├── types.ts           # Types TypeScript partagés
│       ├── mockData.ts        # Données de démonstration
│       └── supabase/          # Clients Supabase (browser + server)
```

## 5. Nom du site

Le code utilise actuellement **« Artyvoo »** (nom de votre site existant) comme
placeholder, dans `src/components/Logo.tsx`, `src/components/Footer.tsx` et
`src/app/layout.tsx`. Pour changer de nom, il suffit de modifier ces 3 fichiers
(recherchez "Artyvoo").

Quelques pistes de noms alternatifs à évaluer ensemble, dans l'esprit
Doctolib/OneDoc appliqué aux artisans :

- **Artizio** — évoque "artisan" + suffixe moderne
- **RdvArtisan** — descriptif, très clair pour le référencement
- **Bricodoc** — clin d'œil à Doctolib côté bricolage
- **Servio** — court, moderne, générique aux 5 métiers

## 6. Charte graphique

- **Bleu** (`brand-blue`, ex. `#1C57C7`) : couleur principale, confiance
- **Orange** (`brand-orange`, ex. `#F26B12`) : accents, boutons d'action
- **Blanc** : fond, lisibilité

Palette complète dans `tailwind.config.ts`.

## 7. Prochaines étapes suggérées

- Connecter Supabase (étape 2 ci-dessus) et remplacer les données de démo
- Ajouter l'envoi d'e-mails de confirmation (ex. via Resend + Supabase Edge Functions)
- Ajouter la validation manuelle des fiches artisans (colonne `valide` déjà prête)
- Ajouter le paiement en ligne si besoin (Stripe)
- Ajouter les notifications SMS de rappel de RDV
