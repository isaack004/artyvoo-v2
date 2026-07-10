// Slug d'URL pour une ville (ex: "Genève" -> "geneve"), utilisé par les
// pages SEO /[metier]/[ville] et le sitemap. Pas de colonne "slug" en base :
// calculé à la volée, les collisions sont improbables sur le jeu de villes
// curaté (voir supabase/migrations/0001_regions.sql).
const DIACRITICS = /[̀-ͯ]/g;

export function slugifyVille(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
