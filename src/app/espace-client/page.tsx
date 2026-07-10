import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { RDV_DEMO, getArtisanById } from "@/lib/mockData";

const STATUT_LABEL: Record<string, string> = {
  confirme: "Confirmé",
  en_attente: "En attente de confirmation",
  annule: "Annulé",
  termine: "Terminé",
};

const STATUT_STYLE: Record<string, string> = {
  confirme: "bg-green-50 text-green-700",
  en_attente: "bg-brand-orange-50 text-brand-orange-600",
  annule: "bg-red-50 text-red-600",
  termine: "bg-brand-blue-50 text-brand-blue-500",
};

// NOTE démo : affiche les RDV de démonstration liés à l'artisan "1".
// Une fois Supabase connecté, filtrer `appointments` par client_id = auth.uid().
export default function EspaceClientPage() {
  const mesRdv = RDV_DEMO;

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Mes rendez-vous</h1>

      {mesRdv.length === 0 ? (
        <div className="card p-10 text-center text-brand-blue-500">
          Vous n'avez pas encore de rendez-vous.
          <div className="mt-4">
            <Link href="/recherche" className="btn-primary">
              Trouver un artisan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {mesRdv.map((r) => {
            const artisan = getArtisanById(r.artisan_id);
            const service = artisan?.services.find((s) => s.id === r.service_id);
            return (
              <div key={r.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-brand-blue-900">{artisan?.entreprise}</p>
                  <p className="text-sm text-brand-blue-500">{service?.nom}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-brand-blue-400">
                    <MapPin size={14} /> {r.adresse_intervention}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="flex items-center gap-1 text-sm font-semibold text-brand-blue-700">
                    <Clock size={14} />
                    {new Date(r.date).toLocaleDateString("fr-CH", { day: "numeric", month: "long" })} à {r.heure}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[r.statut]}`}>
                    {STATUT_LABEL[r.statut]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
