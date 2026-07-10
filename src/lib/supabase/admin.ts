import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client service-role : contourne RLS. Réservé aux Route Handlers serveur
// (webhooks Stripe, compteur de leads gratuits, dashboard admin) — ne jamais
// importer ce module depuis un composant "use client".
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
