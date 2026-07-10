import Link from "next/link";
import { ShieldCheck, CalendarCheck, Star, Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import ArtisanCard from "@/components/ArtisanCard";
import { ARTISANS } from "@/lib/mockData";
import { CANTONS } from "@/lib/constants";

export default function HomePage() {
  const artisansPopulaires = ARTISANS.slice(0, 3);

  return (
    <>
      <section className="bg-gradient-to-b from-brand-blue-50 to-white">
        <div className="container-page flex flex-col items-center gap-8 py-16 text-center">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-brand-blue-900 sm:text-5xl">
            Trouvez un artisan de confiance,{" "}
            <span className="text-brand-orange-500">prenez rendez-vous en ligne</span>
          </h1>
          <p className="max-w-xl text-lg text-brand-blue-600">
            Plombiers, électriciens, serruriers, chauffagistes, jardiniers — disponibles à
            Genève, Vaud, Jura, Berne (Jura bernois) et Valais.
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-brand-blue-500">
            {CANTONS.map((c) => (
              <Link
                key={c.code}
                href={`/recherche?canton=${c.code}`}
                className="rounded-full border border-brand-blue-100 px-3 py-1 hover:border-brand-orange-300 hover:text-brand-orange-600"
              >
                {c.nom}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-brand-blue-900">
          Quel service recherchez-vous ?
        </h2>
        <CategoryGrid />
      </section>

      <section className="bg-brand-blue-900 py-16 text-white">
        <div className="container-page grid gap-10 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-500">
              <Search size={22} />
            </span>
            <h3 className="font-bold">1. Cherchez</h3>
            <p className="text-sm text-brand-blue-200">
              Filtrez par métier et par canton pour trouver l'artisan qu'il vous faut.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-500">
              <CalendarCheck size={22} />
            </span>
            <h3 className="font-bold">2. Réservez</h3>
            <p className="text-sm text-brand-blue-200">
              Choisissez un créneau disponible directement dans l'agenda de l'artisan.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-500">
              <ShieldCheck size={22} />
            </span>
            <h3 className="font-bold">3. Confiez vos travaux</h3>
            <p className="text-sm text-brand-blue-200">
              Profils vérifiés, avis clients authentiques, confirmation immédiate.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-blue-900">Artisans les mieux notés</h2>
          <Link href="/recherche" className="text-sm font-semibold text-brand-orange-500 hover:underline">
            Voir tous les artisans
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artisansPopulaires.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="card flex flex-col items-center gap-4 bg-brand-orange-50 p-10 text-center">
          <Star className="text-brand-orange-500" size={28} />
          <h2 className="text-2xl font-bold text-brand-blue-900">Vous êtes artisan ?</h2>
          <p className="max-w-lg text-brand-blue-600">
            Rejoignez Artyvoo, gérez votre agenda en ligne et recevez de nouveaux clients dans
            votre région, sans commission cachée.
          </p>
          <Link href="/devenir-artisan" className="btn-primary">
            Inscrire mon entreprise
          </Link>
        </div>
      </section>
    </>
  );
}
