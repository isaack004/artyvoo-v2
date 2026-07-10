import { Plus, Pencil } from "lucide-react";
import ProNav from "@/components/ProNav";
import { getArtisanById } from "@/lib/mockData";

export default function ServicesProPage() {
  const artisan = getArtisanById("1")!;

  return (
    <div className="container-page space-y-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue-900">Mes services</h1>
        <button className="btn-primary !px-4 !py-2 text-sm">
          <Plus size={16} /> Ajouter un service
        </button>
      </div>
      <ProNav />

      <div className="card divide-y divide-brand-blue-50 p-2">
        {artisan.services.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-brand-blue-800">{s.nom}</p>
              <p className="text-sm text-brand-blue-400">{s.duree_minutes} min</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-brand-blue-900">{s.prix_chf} CHF</span>
              <button className="text-brand-blue-400 hover:text-brand-orange-500">
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-brand-blue-400">
        Données de démonstration — la gestion réelle (ajout / modification / suppression)
        s'appuiera sur la table <code>services</code> une fois Supabase connecté.
      </p>
    </div>
  );
}
