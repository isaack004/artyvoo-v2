import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Star, Wrench, TrendingUp } from "lucide-react";
import ProNav from "@/components/ProNav";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";
import { getUpcomingAppointmentsForArtisan } from "@/lib/appointments";

export default async function EspaceProPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (!artisan) redirect("/espace-pro/onboarding");

  const rdvAVenir = await getUpcomingAppointmentsForArtisan(supabase, artisan.id);

  const stats = [
    { label: "RDV à venir", valeur: rdvAVenir.length, icon: CalendarDays },
    { label: "Note moyenne", valeur: artisan.note_moyenne.toFixed(1), icon: Star },
    { label: "Services actifs", valeur: artisan.services.length, icon: Wrench },
    { label: "Avis reçus", valeur: artisan.nombre_avis, icon: TrendingUp },
  ];

  return (
    <div className="container-page space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-blue-900">
          Bonjour {(artisan.nom.split(" ")[0] || artisan.entreprise)} 👋
        </h1>
        <p className="text-brand-blue-500">
          {artisan.entreprise} · {artisan.ville}
        </p>
      </div>

      {!artisan.valide && (
        <div className="card border border-brand-orange-200 bg-brand-orange-50 p-4 text-sm text-brand-orange-700">
          Votre profil est en cours de vérification par notre équipe. Il sera visible dans les
          résultats de recherche une fois validé.
        </div>
      )}
      {artisan.valide && !artisan.compte_actif && (
        <div className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Vous avez atteint votre quota de rendez-vous gratuits.{" "}
          <Link href="/espace-pro/abonnement" className="font-semibold underline">
            Activez votre profil
          </Link>{" "}
          pour continuer à recevoir des demandes.
        </div>
      )}

      <ProNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon className="mb-2 text-brand-orange-500" size={22} />
            <p className="text-2xl font-bold text-brand-blue-900">{s.valeur}</p>
            <p className="text-sm text-brand-blue-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-brand-blue-900">Prochains rendez-vous</h2>
        {rdvAVenir.length === 0 ? (
          <p className="text-sm text-brand-blue-400">Aucun rendez-vous à venir pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-brand-blue-50">
            {rdvAVenir.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-brand-blue-800">{r.client_nom}</p>
                  <p className="text-sm text-brand-blue-400">{r.adresse_intervention}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-blue-700">
                    {new Date(r.date).toLocaleDateString("fr-CH", { day: "numeric", month: "long" })} à {r.heure}
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      r.statut === "confirme" ? "text-green-600" : "text-brand-orange-500"
                    }`}
                  >
                    {r.statut === "confirme" ? "Confirmé" : "En attente"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
