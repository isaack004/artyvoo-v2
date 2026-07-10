import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ArtisanCard from "@/components/ArtisanCard";
import { searchArtisans } from "@/lib/mockData";
import { METIERS, findMetier } from "@/lib/constants";
import { fetchCantons } from "@/lib/regions";
import { createClient } from "@/lib/supabase/server";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: { metier?: string; canton?: string; ville?: string };
}) {
  const metier = searchParams.metier ?? "";
  const canton = searchParams.canton ?? "";
  const ville = searchParams.ville ?? "";
  const resultats = searchArtisans({ metier, canton, ville });

  const cantons = await fetchCantons(createClient());
  const metierLabel = findMetier(metier)?.pluriel;
  const cantonLabel = cantons.find((c) => c.code === canton)?.nom;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <SearchBar defaultMetier={metier} defaultCanton={canton} defaultVille={ville} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-brand-blue-500">Filtrer par canton :</span>
        <Link
          href={`/recherche${metier ? `?metier=${metier}` : ""}`}
          className={`rounded-full border px-3 py-1 text-sm ${
            !canton ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600" : "border-brand-blue-100 text-brand-blue-600"
          }`}
        >
          Tous
        </Link>
        {cantons.map((c) => (
          <Link
            key={c.code}
            href={`/recherche?${metier ? `metier=${metier}&` : ""}canton=${c.code}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              canton === c.code
                ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600"
                : "border-brand-blue-100 text-brand-blue-600"
            }`}
          >
            {c.nom}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-brand-blue-500">Métier :</span>
        <Link
          href={`/recherche${canton ? `?canton=${canton}` : ""}`}
          className={`rounded-full border px-3 py-1 text-sm ${
            !metier ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600" : "border-brand-blue-100 text-brand-blue-600"
          }`}
        >
          Tous
        </Link>
        {METIERS.map((m) => (
          <Link
            key={m.slug}
            href={`/recherche?metier=${m.slug}${canton ? `&canton=${canton}` : ""}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              metier === m.slug
                ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600"
                : "border-brand-blue-100 text-brand-blue-600"
            }`}
          >
            {m.nom}
          </Link>
        ))}
      </div>

      <h1 className="mb-6 text-xl font-bold text-brand-blue-900">
        {resultats.length} artisan{resultats.length > 1 ? "s" : ""} trouvé{resultats.length > 1 ? "s" : ""}
        {metierLabel ? ` · ${metierLabel}` : ""}
        {ville ? ` · ${ville}` : cantonLabel ? ` · ${cantonLabel}` : ""}
      </h1>

      {resultats.length === 0 ? (
        <div className="card p-10 text-center text-brand-blue-500">
          Aucun artisan ne correspond à cette recherche pour le moment. Essayez un autre canton
          ou métier.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </div>
      )}
    </div>
  );
}
