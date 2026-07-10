import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client anon sans gestion de cookies, pour les contextes exécutés hors
// requête HTTP (generateStaticParams, sitemap.ts, robots.ts) où
// next/headers.cookies() n'est pas disponible. Lecture publique uniquement.
export function createPublicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
