import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";
import ProNav from "@/components/ProNav";
import SouscrireButton from "@/components/SouscrireButton";
import { PLANS, PRIX_LEAD_CHF, type PlanId } from "@/lib/stripe";

const FEATURES: Record<PlanId, string[]> = {
  starter: ["Leads illimités"],
  pro: ["Leads illimités", "Badge urgence / dimanche", "Position prioritaire", "Statistiques"],
  business: [
    "Leads illimités",
    "Badge urgence / dimanche",
    "Position prioritaire",
    "Statistiques",
    "Multi-utilisateurs",
    "Agenda équipe",
  ],
};

export default async function AbonnementPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (!artisan) redirect("/espace-pro/onboarding");

  const { data: abonnementActuel } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("artisan_id", artisan.id)
    .eq("statut", "active")
    .maybeSingle();

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Abonnement</h1>
      <ProNav />

      {!artisan.compte_actif && (
        <div className="card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Vous avez dépassé vos 5 rendez-vous gratuits. Choisissez un palier ou activez le
          paiement au lead pour continuer à recevoir des demandes.
        </div>
      )}
      {abonnementActuel && (
        <div className="card border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Abonnement actif : <strong>{PLANS[abonnementActuel.plan as PlanId]?.nom}</strong>
        </div>
      )}
      {artisan.pay_per_lead_enabled && !abonnementActuel && (
        <div className="card border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Paiement au lead activé ({PRIX_LEAD_CHF} CHF/lead).
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((id) => (
          <div key={id} className="card flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-bold text-brand-blue-900">{PLANS[id].nom}</h2>
              <p className="text-2xl font-extrabold text-brand-blue-900">
                {PLANS[id].prixChf} CHF<span className="text-sm font-normal text-brand-blue-400">/mois</span>
              </p>
            </div>
            <ul className="flex-1 space-y-2 text-sm text-brand-blue-600">
              {FEATURES[id].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-brand-orange-500" /> {f}
                </li>
              ))}
            </ul>
            <SouscrireButton mode="subscription" plan={id} label="Choisir ce palier" />
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="mb-2 text-lg font-bold text-brand-blue-900">Sans engagement</h2>
        <p className="mb-4 text-sm text-brand-blue-600">
          Pas d&apos;abonnement mensuel : {PRIX_LEAD_CHF} CHF par rendez-vous reçu au-delà de vos 5
          rendez-vous gratuits, prélevés automatiquement sur votre moyen de paiement enregistré.
        </p>
        <SouscrireButton mode="pay_per_lead" label="Activer le paiement au lead" />
      </div>
    </div>
  );
}
