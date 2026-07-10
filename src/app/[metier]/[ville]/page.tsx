import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArtisanCard from "@/components/ArtisanCard";
import { findMetier } from "@/lib/constants";
import { searchArtisans } from "@/lib/artisans";
import { fetchVilles, type Ville } from "@/lib/regions";
import { slugifyVille } from "@/lib/slug";
import { createPublicClient } from "@/lib/supabase/public";

// ISR : les pages ne sont générées que pour les combinaisons métier×ville
// ayant au moins un artisan actif (generateStaticParams ci-dessous).
// dynamicParams=false renvoie un 404 pour toute autre combinaison plutôt
// que de générer une page vide à la demande (pas de contenu pauvre indexé).
export const revalidate = 3600;
export const dynamicParams = false;

async function resolveVille(slug: string): Promise<Ville | null> {
  const villes = await fetchVilles(createPublicClient());
  return villes.find((v) => slugifyVille(v.nom) === slug) ?? null;
}

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("artisans")
      .select("metier, ville")
      .eq("valide", true)
      .eq("compte_actif", true);

    const combos = new Map<string, { metier: string; ville: string }>();
    for (const row of (data ?? []) as { metier: string; ville: string }[]) {
      const villeSlug = slugifyVille(row.ville);
      combos.set(`${row.metier}/${villeSlug}`, { metier: row.metier, ville: villeSlug });
    }
    return Array.from(combos.values());
  } catch {
    // Supabase injoignable au moment du build/de la revalidation : aucune
    // page métier×ville générée cette fois-ci plutôt qu'un build cassé.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { metier: string; ville: string };
}): Promise<Metadata> {
  const metier = findMetier(params.metier);
  const ville = await resolveVille(params.ville);
  if (!metier || !ville) return {};

  const title = `${metier.nom} à ${ville.nom} — Rendez-vous en ligne | Artyvoo`;
  const description = `Trouvez un ${metier.nom.toLowerCase()} disponible à ${ville.nom} et prenez rendez-vous en ligne en quelques clics sur Artyvoo.`;
  return {
    title,
    description,
    alternates: { canonical: `/${params.metier}/${params.ville}` },
    openGraph: { title, description },
  };
}

export default async function MetierVillePage({ params }: { params: { metier: string; ville: string } }) {
  const metier = findMetier(params.metier);
  if (!metier) notFound();
  const ville = await resolveVille(params.ville);
  if (!ville) notFound();

  const supabase = createPublicClient();
  const artisans = await searchArtisans(supabase, { metier: params.metier, canton: ville.canton_code, ville: ville.nom });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: artisans.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: a.entreprise,
        address: {
          "@type": "PostalAddress",
          addressLocality: a.ville,
          addressRegion: a.canton_nom,
          addressCountry: "CH",
        },
        telephone: a.telephone || undefined,
        aggregateRating:
          a.nombre_avis > 0
            ? { "@type": "AggregateRating", ratingValue: a.note_moyenne, reviewCount: a.nombre_avis }
            : undefined,
      },
    })),
  };

  return (
    <div className="container-page py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="mb-2 text-3xl font-extrabold text-brand-blue-900">
        {metier.nom} à {ville.nom}
      </h1>
      <p className="mb-8 text-brand-blue-500">
        {artisans.length} {metier.pluriel.toLowerCase()} disponible{artisans.length > 1 ? "s" : ""} à {ville.nom},
        prêt{artisans.length > 1 ? "s" : ""} à intervenir rapidement.
      </p>

      {artisans.length === 0 ? (
        <div className="card p-10 text-center text-brand-blue-500">
          Aucun {metier.nom.toLowerCase()} disponible à {ville.nom} pour le moment.{" "}
          <Link href="/recherche" className="font-semibold text-brand-orange-500">
            Voir toute la région
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artisans.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </div>
      )}
    </div>
  );
}
