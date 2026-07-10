import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/stripe";

type AbonnementRow = {
  id: string;
  plan: string | null;
  statut: string;
  periode_fin: string | null;
  artisans: { entreprise: string } | null;
};

export default async function AdminAbonnementsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id, plan, statut, periode_fin, artisans(entreprise)")
    .order("created_at", { ascending: false });
  const abonnements = (data ?? []) as unknown as AbonnementRow[];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-brand-blue-900">Abonnements</h2>

      {abonnements.length === 0 ? (
        <p className="text-sm text-brand-blue-400">Aucun abonnement pour l&apos;instant.</p>
      ) : (
        <div className="card divide-y divide-brand-blue-50 p-2">
          {abonnements.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-brand-blue-800">{s.artisans?.entreprise ?? "—"}</p>
                <p className="text-sm text-brand-blue-500">{PLANS[s.plan as PlanId]?.nom ?? s.plan}</p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.statut === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {s.statut}
                </span>
                {s.periode_fin && (
                  <p className="mt-1 text-xs text-brand-blue-400">
                    Renouvelle le {new Date(s.periode_fin).toLocaleDateString("fr-CH")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
