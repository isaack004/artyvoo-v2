import { CalendarDays, Star, Wrench, TrendingUp } from "lucide-react";
import ProNav from "@/components/ProNav";
import { getArtisanById, RDV_DEMO } from "@/lib/mockData";

// NOTE démo : on affiche la fiche de l'artisan id "1". Une fois Supabase
// connecté, remplacer par l'artisan lié à l'utilisateur connecté
// (supabase.auth.getUser() -> table `artisans` filtrée par profile_id).
export default function EspaceProPage() {
  const artisan = getArtisanById("1")!;
  const rdvAVenir = RDV_DEMO.filter((r) => r.statut !== "termine");

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
          Bonjour {artisan.nom.split(" ")[0]} 👋
        </h1>
        <p className="text-brand-blue-500">{artisan.entreprise} · {artisan.ville}</p>
      </div>

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
      </div>
    </div>
  );
}
