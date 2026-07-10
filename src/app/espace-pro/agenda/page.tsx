import { redirect } from "next/navigation";
import ProNav from "@/components/ProNav";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";
import { getAllAppointmentsForArtisan } from "@/lib/appointments";

const STATUT_STYLE: Record<string, string> = {
  confirme: "bg-green-50 text-green-700",
  en_attente: "bg-brand-orange-50 text-brand-orange-600",
  annule: "bg-red-50 text-red-600",
  termine: "bg-brand-blue-50 text-brand-blue-500",
};

const STATUT_LABEL: Record<string, string> = {
  confirme: "Confirmé",
  en_attente: "En attente",
  annule: "Annulé",
  termine: "Terminé",
};

export default async function AgendaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (!artisan) redirect("/espace-pro/onboarding");

  const rdvTries = await getAllAppointmentsForArtisan(supabase, artisan.id);

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Mon agenda</h1>
      <ProNav />

      {rdvTries.length === 0 ? (
        <div className="card p-10 text-center text-brand-blue-500">
          Aucun rendez-vous pour l&apos;instant.
        </div>
      ) : (
        <div className="card divide-y divide-brand-blue-50 p-2">
          {rdvTries.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-brand-blue-800">{r.client_nom}</p>
                <p className="text-sm text-brand-blue-500">{r.adresse_intervention}</p>
                <p className="text-sm text-brand-blue-400">
                  {r.client_telephone} · {r.client_email}
                </p>
                {r.notes && <p className="mt-1 text-sm text-brand-blue-500">« {r.notes} »</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-blue-700">
                    {new Date(r.date).toLocaleDateString("fr-CH", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-sm text-brand-blue-500">{r.heure}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[r.statut]}`}>
                  {STATUT_LABEL[r.statut]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
