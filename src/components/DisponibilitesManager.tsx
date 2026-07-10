"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type Plage = { actif: boolean; debut: string; fin: string };
type DisponibiliteRow = { jour_semaine: number; heure_debut: string; heure_fin: string };

function initialPlages(existantes: DisponibiliteRow[]): Plage[] {
  return JOURS.map((_, i) => {
    const existante = existantes.find((d) => d.jour_semaine === i);
    return existante
      ? { actif: true, debut: existante.heure_debut.slice(0, 5), fin: existante.heure_fin.slice(0, 5) }
      : { actif: false, debut: "08:00", fin: "17:30" };
  });
}

export default function DisponibilitesManager({
  artisanId,
  initialDisponibilites,
}: {
  artisanId: string;
  initialDisponibilites: DisponibiliteRow[];
}) {
  const supabase = createClient();
  const [plages, setPlages] = useState<Plage[]>(initialPlages(initialDisponibilites));
  const [saving, setSaving] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, patch: Partial<Plage>) {
    setPlages((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    setEnregistre(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from("disponibilites").delete().eq("artisan_id", artisanId);
      if (deleteError) throw deleteError;

      const lignes = plages
        .map((p, i) => ({ ...p, jour: i }))
        .filter((p) => p.actif)
        .map((p) => ({ artisan_id: artisanId, jour_semaine: p.jour, heure_debut: p.debut, heure_fin: p.fin }));

      if (lignes.length > 0) {
        const { error: insertError } = await supabase.from("disponibilites").insert(lignes);
        if (insertError) throw insertError;
      }

      setEnregistre(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer vos disponibilités.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card divide-y divide-brand-blue-50 p-2">
        {JOURS.map((jour, i) => (
          <div key={jour} className="flex flex-wrap items-center gap-4 p-4">
            <label className="flex w-32 items-center gap-2 font-semibold text-brand-blue-800">
              <input
                type="checkbox"
                checked={plages[i].actif}
                onChange={(e) => update(i, { actif: e.target.checked })}
                className="h-4 w-4 accent-brand-orange-500"
              />
              {jour}
            </label>
            {plages[i].actif ? (
              <div className="flex items-center gap-2 text-sm text-brand-blue-600">
                <input
                  type="time"
                  value={plages[i].debut}
                  onChange={(e) => update(i, { debut: e.target.value })}
                  className="input-field !w-auto !py-1.5"
                />
                <span>à</span>
                <input
                  type="time"
                  value={plages[i].fin}
                  onChange={(e) => update(i, { fin: e.target.value })}
                  className="input-field !w-auto !py-1.5"
                />
              </div>
            ) : (
              <span className="text-sm text-brand-blue-300">Fermé</span>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? "Enregistrement..." : "Enregistrer mes disponibilités"}
      </button>
      {enregistre && <p className="text-sm font-semibold text-green-600">Disponibilités enregistrées ✓</p>}
    </>
  );
}
