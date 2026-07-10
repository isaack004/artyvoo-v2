import { CalendarDays, Users, Wrench, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PRIX_LEAD_CHF, type PlanId } from "@/lib/stripe";

export default async function AdminStatsPage() {
  const supabase = createClient();

  const maintenant = new Date();
  const debutSemaine = new Date(maintenant);
  debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
  debutSemaine.setHours(0, 0, 0, 0);
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

  const [
    { count: rdvTotal },
    { count: rdvSemaine },
    { count: rdvMois },
    { count: artisansTotal },
    { count: artisansEnAttente },
    { count: particuliersTotal },
    { data: abonnementsActifs },
    { data: leadsPaid },
  ] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("date", debutSemaine.toISOString().slice(0, 10)),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("date", debutMois.toISOString().slice(0, 10)),
    supabase.from("artisans").select("id", { count: "exact", head: true }),
    supabase.from("artisans").select("id", { count: "exact", head: true }).eq("valide", false),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "particulier"),
    supabase.from("subscriptions").select("plan").eq("statut", "active"),
    supabase.from("leads_paid").select("montant_chf"),
  ]);

  const revenusAbonnements = (abonnementsActifs ?? []).reduce(
    (total, s) => total + (PLANS[s.plan as PlanId]?.prixChf ?? 0),
    0
  );
  const revenusLeads = (leadsPaid ?? []).reduce((total, l) => total + Number(l.montant_chf), 0);

  const stats = [
    { label: "RDV cette semaine", valeur: rdvSemaine ?? 0, icon: CalendarDays },
    { label: "RDV ce mois", valeur: rdvMois ?? 0, icon: CalendarDays },
    { label: "RDV au total", valeur: rdvTotal ?? 0, icon: CalendarDays },
    { label: "Artisans inscrits", valeur: artisansTotal ?? 0, icon: Wrench },
    { label: "Dont en attente de validation", valeur: artisansEnAttente ?? 0, icon: Wrench },
    { label: "Particuliers inscrits", valeur: particuliersTotal ?? 0, icon: Users },
    { label: "Revenus abonnements (CHF/mois)", valeur: revenusAbonnements, icon: TrendingUp },
    { label: `Revenus pay-per-lead (${PRIX_LEAD_CHF} CHF/lead)`, valeur: `${revenusLeads} CHF`, icon: TrendingUp },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5">
          <s.icon className="mb-2 text-brand-orange-500" size={22} />
          <p className="text-2xl font-bold text-brand-blue-900">{s.valeur}</p>
          <p className="text-sm text-brand-blue-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
