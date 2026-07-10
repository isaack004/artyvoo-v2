"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { searchArtisans } from "@/lib/artisans";
import { getAvailableSlots } from "@/lib/availability";
import { Artisan, CreneauDisponible } from "@/lib/types";
import { METIERS } from "@/lib/constants";
import MetierIcon from "@/components/MetierIcon";
import RegionPicker from "@/components/RegionPicker";
import StarRating from "@/components/StarRating";

type Etape = 1 | 2 | 3;

function formatDateCourte(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CH", { weekday: "short", day: "numeric", month: "short" });
}

export default function ReservationFlow() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [etape, setEtape] = useState<Etape>(1);
  const [metier, setMetier] = useState("");
  const [canton, setCanton] = useState("");
  const [ville, setVille] = useState("");

  const [artisansTrouves, setArtisansTrouves] = useState<Artisan[]>([]);
  const [prochainsCreneaux, setProchainsCreneaux] = useState<Record<string, CreneauDisponible | null>>({});
  const [chargement, setChargement] = useState(false);

  function handleChoisirMetier(slug: string) {
    setMetier(slug);
    setEtape(2);
  }

  async function handleValiderRegion() {
    setEtape(3);
    setChargement(true);
    const resultats = await searchArtisans(supabase, { metier, canton, ville });
    setArtisansTrouves(resultats);

    const entries = await Promise.all(
      resultats.map(async (a) => {
        const creneaux = await getAvailableSlots(supabase, a.id, { jours: 7 });
        return [a.id, creneaux[0] ?? null] as const;
      })
    );
    setProchainsCreneaux(Object.fromEntries(entries));
    setChargement(false);
  }

  function handleChoisirArtisan(artisan: Artisan) {
    const prochain = prochainsCreneaux[artisan.id];
    const params = new URLSearchParams();
    if (prochain) {
      params.set("date", prochain.date);
      params.set("heure", prochain.heures[0]);
    }
    router.push(`/rdv/${artisan.id}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6 flex items-center gap-3 text-sm text-brand-blue-500">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                etape >= n ? "bg-brand-orange-500 text-white" : "bg-brand-blue-50 text-brand-blue-400"
              }`}
            >
              {n}
            </span>
            {n < 3 && <span className="h-px w-8 bg-brand-blue-100" />}
          </div>
        ))}
      </div>

      <h1 className="mb-8 text-2xl font-bold text-brand-blue-900">Trouver un artisan disponible</h1>

      {etape === 1 && (
        <div>
          <h2 className="mb-4 font-semibold text-brand-blue-800">1. Quel est votre besoin ?</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {METIERS.map((m) => (
              <button
                key={m.slug}
                onClick={() => handleChoisirMetier(m.slug)}
                className="card flex flex-col items-center gap-3 p-6 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-50 text-brand-orange-500">
                  <MetierIcon nom={m.icone} size={26} />
                </span>
                <span className="font-semibold text-brand-blue-800">{m.pluriel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {etape === 2 && (
        <div>
          <button
            onClick={() => setEtape(1)}
            className="mb-4 flex items-center gap-1 text-sm text-brand-blue-500 hover:text-brand-orange-500"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <h2 className="mb-4 font-semibold text-brand-blue-800">2. Où intervenez-vous ?</h2>
          <RegionPicker canton={canton} ville={ville} onCantonChange={setCanton} onVilleChange={setVille} variant="stacked" />
          <button
            onClick={handleValiderRegion}
            disabled={!canton}
            className="btn-primary mt-4 w-full"
          >
            Voir les artisans disponibles
          </button>
        </div>
      )}

      {etape === 3 && (
        <div>
          <button
            onClick={() => setEtape(2)}
            className="mb-4 flex items-center gap-1 text-sm text-brand-blue-500 hover:text-brand-orange-500"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <h2 className="mb-4 font-semibold text-brand-blue-800">3. Choisissez un artisan et un créneau</h2>

          {chargement ? (
            <p className="text-sm text-brand-blue-400">Recherche des artisans disponibles...</p>
          ) : artisansTrouves.length === 0 ? (
            <div className="card p-10 text-center text-brand-blue-500">
              Aucun artisan disponible pour le moment dans cette zone. Essayez un autre canton.
            </div>
          ) : (
            <div className="space-y-4">
              {artisansTrouves.map((a) => {
                const prochain = prochainsCreneaux[a.id];
                return (
                  <button
                    key={a.id}
                    onClick={() => handleChoisirArtisan(a)}
                    className="card flex w-full flex-col gap-3 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-brand-blue-900">{a.entreprise}</h3>
                        {a.urgence_disponible && (
                          <span className="flex items-center gap-1 rounded-full bg-brand-orange-50 px-2 py-0.5 text-xs font-semibold text-brand-orange-600">
                            <Zap size={12} /> Urgence
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-sm text-brand-blue-500">
                        <MapPin size={14} /> {a.ville}, {a.canton_nom}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating note={a.note_moyenne} size={14} />
                        <span className="text-sm text-brand-blue-400">({a.nombre_avis} avis)</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {prochain ? (
                        <span className="rounded-full bg-brand-blue-50 px-3 py-1.5 text-sm font-semibold text-brand-blue-700">
                          Prochain créneau : {formatDateCourte(prochain.date)} à {prochain.heures[0]}
                        </span>
                      ) : (
                        <span className="text-sm text-brand-blue-400">Voir les créneaux</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
