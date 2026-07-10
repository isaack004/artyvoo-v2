import Link from "next/link";
import { MapPin, Zap } from "lucide-react";
import { Artisan } from "@/lib/types";
import { findMetier, findCanton } from "@/lib/constants";
import StarRating from "./StarRating";

export default function ArtisanCard({ artisan }: { artisan: Artisan }) {
  const metier = findMetier(artisan.metier);
  const canton = findCanton(artisan.canton);
  const prixMin = Math.min(...artisan.services.map((s) => s.prix_chf));

  return (
    <Link href={`/artisan/${artisan.id}`} className="card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange-500">
            {metier?.nom}
          </p>
          <h3 className="text-lg font-bold text-brand-blue-900">{artisan.entreprise}</h3>
          <p className="text-sm text-brand-blue-500">{artisan.nom}</p>
        </div>
        {artisan.urgence_disponible && (
          <span className="flex items-center gap-1 rounded-full bg-brand-orange-50 px-2 py-1 text-xs font-semibold text-brand-orange-600">
            <Zap size={12} /> Urgence
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-brand-blue-600">
        <MapPin size={16} />
        {artisan.ville}, {canton?.nom}
      </div>

      <div className="flex items-center gap-2">
        <StarRating note={artisan.note_moyenne} />
        <span className="text-sm font-semibold text-brand-blue-800">{artisan.note_moyenne.toFixed(1)}</span>
        <span className="text-sm text-brand-blue-400">({artisan.nombre_avis} avis)</span>
      </div>

      <p className="line-clamp-2 text-sm text-brand-blue-500">{artisan.bio}</p>

      <div className="mt-auto flex items-center justify-between border-t border-brand-blue-50 pt-4">
        <span className="text-sm text-brand-blue-500">
          Dès <span className="font-bold text-brand-blue-900">{prixMin} CHF</span>
        </span>
        <span className="btn-primary !px-4 !py-2 text-sm">Prendre RDV</span>
      </div>
    </Link>
  );
}
