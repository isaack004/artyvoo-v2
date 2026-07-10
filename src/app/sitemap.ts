import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { slugifyVille } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://artyvoo.ch";

  const combos = new Set<string>();
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("artisans")
      .select("metier, ville")
      .eq("valide", true)
      .eq("compte_actif", true);
    for (const row of (data ?? []) as { metier: string; ville: string }[]) {
      combos.add(`${row.metier}/${slugifyVille(row.ville)}`);
    }
  } catch {
    // Supabase injoignable : sitemap réduit aux pages statiques plutôt
    // qu'une erreur 500 sur /sitemap.xml.
  }

  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/recherche`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/reserver`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/devenir-artisan`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const pagesMetierVille: MetadataRoute.Sitemap = Array.from(combos).map((combo) => ({
    url: `${base}/${combo}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pagesStatiques, ...pagesMetierVille];
}
