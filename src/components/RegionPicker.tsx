"use client";

import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchCantons, fetchVilles, findNearestVille, type Canton, type Ville } from "@/lib/regions";

type RegionPickerProps = {
  canton: string;
  ville: string;
  onCantonChange: (canton: string) => void;
  onVilleChange: (ville: string) => void;
  // "stacked" : bouton géoloc pleine largeur + selects l'un sous l'autre (ex: /reserver)
  // "inline" : geoloc en icône + selects sur une ligne (ex: barre de recherche)
  variant?: "stacked" | "inline";
};

export default function RegionPicker({
  canton,
  ville,
  onCantonChange,
  onVilleChange,
  variant = "stacked",
}: RegionPickerProps) {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    fetchCantons(createClient()).then(setCantons);
  }, []);

  useEffect(() => {
    if (!canton) {
      setVilles([]);
      return;
    }
    fetchVilles(createClient(), canton).then(setVilles);
  }, [canton]);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setGeoError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const toutesVilles = await fetchVilles(createClient());
        const proche = findNearestVille(toutesVilles, position.coords.latitude, position.coords.longitude);
        setLocating(false);
        if (proche) {
          onCantonChange(proche.canton_code);
          onVilleChange(proche.nom);
        } else {
          setGeoError("Impossible de déterminer votre ville, sélectionnez-la manuellement.");
        }
      },
      () => {
        setLocating(false);
        setGeoError("Position refusée. Sélectionnez votre canton et votre ville ci-dessous.");
      },
      { timeout: 8000 }
    );
  }

  const selectClass = variant === "inline" ? "input-field !border-none sm:flex-1" : "input-field";

  return (
    <div className={variant === "inline" ? "contents" : "space-y-3"}>
      {variant === "stacked" ? (
        <button type="button" onClick={handleLocate} disabled={locating} className="btn-secondary w-full">
          <LocateFixed size={18} />
          {locating ? "Localisation en cours..." : "Utiliser ma position"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          title="Utiliser ma position"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-blue-400 transition hover:bg-brand-blue-50 hover:text-brand-blue-600 disabled:opacity-50"
        >
          <LocateFixed size={18} />
        </button>
      )}

      {geoError && (
        <p className={variant === "inline" ? "w-full text-sm text-red-600" : "text-sm text-red-600"}>
          {geoError}
        </p>
      )}

      <select
        value={canton}
        onChange={(e) => {
          onCantonChange(e.target.value);
          onVilleChange("");
        }}
        className={selectClass}
      >
        <option value="">Canton</option>
        {cantons.map((c) => (
          <option key={c.code} value={c.code}>
            {c.nom}
          </option>
        ))}
      </select>

      <select
        value={ville}
        onChange={(e) => onVilleChange(e.target.value)}
        disabled={!canton}
        className={selectClass}
      >
        <option value="">{canton ? "Ville" : "Choisissez d'abord un canton"}</option>
        {villes.map((v) => (
          <option key={v.id} value={v.nom}>
            {v.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
