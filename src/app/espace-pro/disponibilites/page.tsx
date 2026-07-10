import { redirect } from "next/navigation";
import ProNav from "@/components/ProNav";
import DisponibilitesManager from "@/components/DisponibilitesManager";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";

export default async function DisponibilitesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (!artisan) redirect("/espace-pro/onboarding");

  const { data: disponibilites } = await supabase
    .from("disponibilites")
    .select("jour_semaine, heure_debut, heure_fin")
    .eq("artisan_id", artisan.id);

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Mes disponibilités</h1>
      <ProNav />
      <DisponibilitesManager artisanId={artisan.id} initialDisponibilites={disponibilites ?? []} />
    </div>
  );
}
