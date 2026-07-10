import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";
import ArtisanOnboardingForm from "@/components/ArtisanOnboardingForm";

export default async function EspaceProOnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (artisan) redirect("/espace-pro");

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-brand-blue-900">
        Complétez votre fiche artisan
      </h1>
      <ArtisanOnboardingForm />
    </div>
  );
}
