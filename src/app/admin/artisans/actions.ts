"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Re-vérifie le rôle admin dans l'action elle-même : une Server Action est
// un endpoint appelable directement, la vérification faite dans le layout
// ne suffit pas à elle seule.
async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Accès refusé.");
}

export async function accepterArtisan(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("artisans").update({ valide: true }).eq("id", id);
  revalidatePath("/admin/artisans");
}

export async function refuserArtisan(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("artisans").delete().eq("id", id);
  revalidatePath("/admin/artisans");
}
