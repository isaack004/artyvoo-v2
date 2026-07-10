import type { SupabaseClient } from "@supabase/supabase-js";

// Remplace la partie cantons/villes de src/lib/constants.ts (qui ne gardera
// que METIERS) une fois l'UI branchée sur ces tables (voir migration 0001).
// METIERS reste dans constants.ts : catalogue métier fixe du site, pas
// concerné par la généricité régionale.

export type Canton = {
  code: string;
  nom: string;
};

export type Ville = {
  id: string;
  canton_code: string;
  nom: string;
  npa: string | null;
  lat: number | null;
  lng: number | null;
};

export async function fetchCantons(supabase: SupabaseClient): Promise<Canton[]> {
  const { data, error } = await supabase.from("cantons").select("code, nom").order("nom");
  if (error) throw error;
  return data ?? [];
}

export async function fetchVilles(supabase: SupabaseClient, cantonCode?: string): Promise<Ville[]> {
  let query = supabase.from("villes").select("id, canton_code, nom, npa, lat, lng").order("nom");
  if (cantonCode) query = query.eq("canton_code", cantonCode);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// À l'inscription d'un artisan avec une ville absente de la table (saisie
// libre associée à un canton choisi dans un <select>), on l'ajoute sans
// nécessiter de déploiement. Idempotent grâce à la contrainte unique
// (canton_code, nom) de la migration 0001.
export async function ensureVille(
  supabase: SupabaseClient,
  cantonCode: string,
  nom: string
): Promise<Ville> {
  const { data: existing } = await supabase
    .from("villes")
    .select("id, canton_code, nom, npa, lat, lng")
    .eq("canton_code", cantonCode)
    .eq("nom", nom)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("villes")
    .insert({ canton_code: cantonCode, nom })
    .select("id, canton_code, nom, npa, lat, lng")
    .single();
  if (error) throw error;
  return data;
}

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Résout la ville la plus proche à partir d'une position navigateur, sur un
// jeu de villes déjà chargé (pas de round-trip réseau au moment du calcul).
export function findNearestVille(villes: Ville[], lat: number, lng: number): Ville | null {
  let nearest: Ville | null = null;
  let nearestDistance = Infinity;
  for (const ville of villes) {
    if (ville.lat === null || ville.lng === null) continue;
    const distance = haversineDistanceKm(lat, lng, ville.lat, ville.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = ville;
    }
  }
  return nearest;
}
