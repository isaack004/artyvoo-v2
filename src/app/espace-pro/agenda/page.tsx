import ProNav from "@/components/ProNav";
import { RDV_DEMO } from "@/lib/mockData";

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

export default function AgendaPage() {
  const rdvTries = [...RDV_DEMO].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Mon agenda</h1>
      <ProNav />

      <div className="card divide-y divide-brand-blue-50 p-2">
        {rdvTries.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-brand-blue-800">{r.client_nom}</p>
              <p className="text-sm text-brand-blue-500">{r.adresse_intervention}</p>
              <p className="text-sm text-brand-blue-400">{r.client_telephone} · {r.client_email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-blue-700">
                  {new Date(r.date).toLocaleDateString("fr-CH", { weekday: "short", day: "numeric", month: "short" })}
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

      <p className="text-xs text-brand-blue-400">
        Données de démonstration — une fois Supabase connecté, cet agenda lira la table{" "}
        <code>appointments</code> filtrée par artisan.
      </p>
    </div>
  );
}
