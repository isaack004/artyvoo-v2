"use client";

import { useState } from "react";
import ProNav from "@/components/ProNav";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type Plage = { actif: boolean; debut: string; fin: string };

const DEFAUT: Plage[] = JOURS.map((_, i) => ({
  actif: i < 5,
  debut: "08:00",
  fin: "17:30",
}));

export default function DisponibilitesPage() {
  const [plages, setPlages] = useState<Plage[]>(DEFAUT);
  const [enregistre, setEnregistre] = useState(false);

  function update(i: number, patch: Partial<Plage>) {
    setPlages((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    setEnregistre(false);
  }

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Mes disponibilités</h1>
      <ProNav />

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

      <button
        onClick={() => setEnregistre(true)}
        className="btn-primary"
      >
        Enregistrer mes disponibilités
      </button>
      {enregistre && (
        <p className="text-sm font-semibold text-green-600">Disponibilités enregistrées ✓</p>
      )}

      <p className="text-xs text-brand-blue-400">
        Ces réglages correspondent à la table <code>disponibilites</code> du schéma Supabase
        (jour de semaine + plage horaire récurrente). Les congés ponctuels se gèrent via la table{" "}
        <code>indisponibilites</code>.
      </p>
    </div>
  );
}
