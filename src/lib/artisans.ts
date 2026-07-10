import type { SupabaseClient } from "@supabase/supabase-js";
import type { Artisan, Avis, Service } from "./types";

// Remplace src/lib/mockData.ts : requêtes Supabase réelles pour les
// artisans, leurs services et leurs avis. note_moyenne/nombre_avis ne sont
// pas des colonnes stockées (voir supabase/schema.sql) — calculées ici à
// partir des avis joints.

const ARTISAN_SELECT =
  "*, cantons(nom), profiles(prenom, nom), services(*), avis(id, note, commentaire, created_at, profiles(prenom, nom))";

type ProfileRef = { prenom: string | null; nom: string | null } | null;

type ArtisanRow = {
  id: string;
  profile_id: string;
  entreprise: string;
  metier: string;
  canton: string;
  cantons: { nom: string } | null;
  ville: string;
  adresse: string;
  bio: string | null;
  telephone: string | null;
  email: string | null;
  annees_experience: number;
  urgence_disponible: boolean;
  photo_url: string | null;
  valide: boolean;
  ide_number: string | null;
  ide_verifie: boolean;
  specialites: string[];
  couverture_canton_entier: boolean;
  leads_gratuits_utilises: number;
  compte_actif: boolean;
  profiles: ProfileRef;
  services: Service[] | null;
  avis: { id: string; note: number; commentaire: string | null; created_at: string; profiles: ProfileRef }[] | null;
};

function displayName(profile: ProfileRef): string {
  if (!profile) return "";
  return `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim();
}

function mapArtisanRow(row: ArtisanRow): Artisan {
  const avisMappes: Avis[] = (row.avis ?? []).map((a) => ({
    id: a.id,
    auteur: a.profiles
      ? `${a.profiles.prenom ?? ""} ${a.profiles.nom ? `${a.profiles.nom[0]}.` : ""}`.trim() || "Client"
      : "Client",
    note: a.note,
    commentaire: a.commentaire ?? "",
    date: a.created_at?.slice(0, 10) ?? "",
  }));
  const nombreAvis = avisMappes.length;
  const noteMoyenne = nombreAvis > 0 ? avisMappes.reduce((sum, a) => sum + a.note, 0) / nombreAvis : 0;

  return {
    id: row.id,
    profile_id: row.profile_id,
    nom: displayName(row.profiles),
    entreprise: row.entreprise,
    metier: row.metier,
    canton: row.canton,
    canton_nom: row.cantons?.nom,
    ville: row.ville,
    adresse: row.adresse,
    note_moyenne: noteMoyenne,
    nombre_avis: nombreAvis,
    photo_url: row.photo_url ?? undefined,
    bio: row.bio ?? "",
    services: row.services ?? [],
    avis: avisMappes,
    urgence_disponible: row.urgence_disponible,
    annees_experience: row.annees_experience,
    telephone: row.telephone ?? "",
    email: row.email ?? "",
    valide: row.valide,
    ide_number: row.ide_number,
    ide_verifie: row.ide_verifie,
    specialites: row.specialites ?? [],
    couverture_canton_entier: row.couverture_canton_entier,
    leads_gratuits_utilises: row.leads_gratuits_utilises,
    compte_actif: row.compte_actif,
  };
}

// Lecture publique (fiche artisan, entrée du parcours de réservation) : en
// cas d'erreur réseau/Supabase, on dégrade vers "introuvable" plutôt que de
// faire planter la page (le composant appelant fait déjà un notFound()).
export async function getArtisanById(supabase: SupabaseClient, id: string): Promise<Artisan | null> {
  try {
    const { data, error } = await supabase.from("artisans").select(ARTISAN_SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapArtisanRow(data as unknown as ArtisanRow) : null;
  } catch {
    return null;
  }
}

export async function getArtisanByProfileId(supabase: SupabaseClient, profileId: string): Promise<Artisan | null> {
  const { data, error } = await supabase
    .from("artisans")
    .select(ARTISAN_SELECT)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArtisanRow(data as unknown as ArtisanRow) : null;
}

// Matching metier + zone de couverture délégué à la fonction SQL
// search_artisans (migration 0006), qui gère villes précises et
// couverture_canton_entier. Cf. commentaire de référence en 0005.
// Lecture publique : dégrade vers une liste vide en cas d'erreur
// réseau/Supabase plutôt que de faire planter les pages de recherche.
export async function searchArtisans(
  supabase: SupabaseClient,
  params: { metier?: string; canton?: string; ville?: string }
): Promise<Artisan[]> {
  try {
    let villeId: string | null = null;
    if (params.ville && params.canton) {
      const { data: ville } = await supabase
        .from("villes")
        .select("id")
        .eq("canton_code", params.canton)
        .eq("nom", params.ville)
        .maybeSingle();
      villeId = (ville as { id: string } | null)?.id ?? null;
      if (!villeId) return [];
    }

    const { data: matches, error: rpcError } = await supabase.rpc("search_artisans", {
      p_metier: params.metier || null,
      p_canton: params.canton || null,
      p_ville_id: villeId,
    });
    if (rpcError) throw rpcError;
    const ids = ((matches as { id: string }[] | null) ?? []).map((r) => r.id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase.from("artisans").select(ARTISAN_SELECT).in("id", ids);
    if (error) throw error;
    return ((data as unknown as ArtisanRow[]) ?? []).map(mapArtisanRow);
  } catch {
    return [];
  }
}

export async function getArtisanVilles(
  supabase: SupabaseClient,
  artisanId: string
): Promise<{ id: string; nom: string; canton_code: string }[]> {
  const { data, error } = await supabase
    .from("artisan_villes")
    .select("villes(id, nom, canton_code)")
    .eq("artisan_id", artisanId);
  if (error) throw error;
  return ((data as unknown as { villes: { id: string; nom: string; canton_code: string } | null }[]) ?? [])
    .map((r) => r.villes)
    .filter((v): v is { id: string; nom: string; canton_code: string } => v !== null);
}
