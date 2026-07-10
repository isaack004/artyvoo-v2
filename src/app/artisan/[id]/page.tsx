import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Mail, Zap, Award } from "lucide-react";
import { getArtisanById } from "@/lib/mockData";
import { findMetier, findCanton } from "@/lib/constants";
import StarRating from "@/components/StarRating";

export default function ArtisanPage({ params }: { params: { id: string } }) {
  const artisan = getArtisanById(params.id);
  if (!artisan) notFound();

  const metier = findMetier(artisan.metier);
  const canton = findCanton(artisan.canton);

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange-500">
          {metier?.nom}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-blue-900">{artisan.entreprise}</h1>
        <p className="mt-1 text-brand-blue-500">{artisan.nom}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-blue-600">
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {artisan.adresse}, {canton?.nom}
          </span>
          <span className="flex items-center gap-1">
            <Award size={16} /> {artisan.annees_experience} ans d'expérience
          </span>
          {artisan.urgence_disponible && (
            <span className="flex items-center gap-1 rounded-full bg-brand-orange-50 px-2 py-1 font-semibold text-brand-orange-600">
              <Zap size={14} /> Disponible en urgence
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StarRating note={artisan.note_moyenne} />
          <span className="font-semibold text-brand-blue-800">{artisan.note_moyenne.toFixed(1)}</span>
          <span className="text-brand-blue-400">({artisan.nombre_avis} avis)</span>
        </div>

        <section className="card mt-8 p-6">
          <h2 className="mb-3 text-lg font-bold text-brand-blue-900">À propos</h2>
          <p className="text-brand-blue-600">{artisan.bio}</p>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-blue-900">Services proposés</h2>
          <ul className="divide-y divide-brand-blue-50">
            {artisan.services.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-brand-blue-800">{s.nom}</p>
                  <p className="text-sm text-brand-blue-400">{s.duree_minutes} min</p>
                </div>
                <span className="font-bold text-brand-blue-900">{s.prix_chf} CHF</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-blue-900">Avis clients</h2>
          <div className="space-y-4">
            {artisan.avis.map((a) => (
              <div key={a.id} className="border-b border-brand-blue-50 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-blue-800">{a.auteur}</p>
                  <StarRating note={a.note} size={14} />
                </div>
                <p className="mt-1 text-sm text-brand-blue-500">{a.commentaire}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-blue-900">Prendre rendez-vous</h2>
          <div className="mb-4 space-y-2 text-sm text-brand-blue-600">
            <p className="flex items-center gap-2">
              <Phone size={16} /> {artisan.telephone}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} /> {artisan.email}
            </p>
          </div>
          <Link href={`/rdv/${artisan.id}`} className="btn-primary w-full">
            Choisir un créneau
          </Link>
        </div>
      </aside>
    </div>
  );
}
