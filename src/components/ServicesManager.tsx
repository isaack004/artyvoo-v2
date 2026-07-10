"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Service } from "@/lib/types";

type Brouillon = { nom: string; duree_minutes: string; prix_chf: string; description: string };
const BROUILLON_VIDE: Brouillon = { nom: "", duree_minutes: "60", prix_chf: "", description: "" };

export default function ServicesManager({ artisanId, initialServices }: { artisanId: string; initialServices: Service[] }) {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState<Brouillon>(BROUILLON_VIDE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(s: Service) {
    setEditId(s.id);
    setAjoutOuvert(false);
    setBrouillon({
      nom: s.nom,
      duree_minutes: String(s.duree_minutes),
      prix_chf: String(s.prix_chf),
      description: s.description ?? "",
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("services")
        .insert({
          artisan_id: artisanId,
          nom: brouillon.nom,
          duree_minutes: Number(brouillon.duree_minutes) || 30,
          prix_chf: Number(brouillon.prix_chf) || 0,
          description: brouillon.description || null,
        })
        .select("id, nom, duree_minutes, prix_chf, description")
        .single();
      if (insertError) throw insertError;
      setServices((prev) => [...prev, data as Service]);
      setAjoutOuvert(false);
      setBrouillon(BROUILLON_VIDE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter ce service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("services")
        .update({
          nom: brouillon.nom,
          duree_minutes: Number(brouillon.duree_minutes) || 30,
          prix_chf: Number(brouillon.prix_chf) || 0,
          description: brouillon.description || null,
        })
        .eq("id", id);
      if (updateError) throw updateError;
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                nom: brouillon.nom,
                duree_minutes: Number(brouillon.duree_minutes) || 30,
                prix_chf: Number(brouillon.prix_chf) || 0,
                description: brouillon.description,
              }
            : s
        )
      );
      setEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier ce service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue-900">Mes services</h1>
        <button
          type="button"
          onClick={() => {
            setAjoutOuvert((v) => !v);
            setEditId(null);
            setBrouillon(BROUILLON_VIDE);
          }}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          <Plus size={16} /> Ajouter un service
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {ajoutOuvert && (
        <form onSubmit={handleAdd} className="card space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Nom du service"
              className="input-field sm:col-span-1"
              value={brouillon.nom}
              onChange={(e) => setBrouillon({ ...brouillon, nom: e.target.value })}
            />
            <input
              required
              type="number"
              min={1}
              placeholder="Durée (min)"
              className="input-field"
              value={brouillon.duree_minutes}
              onChange={(e) => setBrouillon({ ...brouillon, duree_minutes: e.target.value })}
            />
            <input
              required
              type="number"
              min={0}
              placeholder="Prix (CHF)"
              className="input-field"
              value={brouillon.prix_chf}
              onChange={(e) => setBrouillon({ ...brouillon, prix_chf: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary !px-4 !py-2 text-sm">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="card divide-y divide-brand-blue-50 p-2">
        {services.length === 0 && (
          <p className="p-4 text-sm text-brand-blue-400">Vous n&apos;avez pas encore de service.</p>
        )}
        {services.map((s) =>
          editId === s.id ? (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <input
                className="input-field !w-40"
                value={brouillon.nom}
                onChange={(e) => setBrouillon({ ...brouillon, nom: e.target.value })}
              />
              <input
                type="number"
                className="input-field !w-28"
                value={brouillon.duree_minutes}
                onChange={(e) => setBrouillon({ ...brouillon, duree_minutes: e.target.value })}
              />
              <input
                type="number"
                className="input-field !w-28"
                value={brouillon.prix_chf}
                onChange={(e) => setBrouillon({ ...brouillon, prix_chf: e.target.value })}
              />
              <button
                type="button"
                onClick={() => handleSaveEdit(s.id)}
                disabled={saving}
                className="text-green-600 hover:text-green-700"
              >
                <Check size={18} />
              </button>
              <button type="button" onClick={() => setEditId(null)} className="text-brand-blue-400 hover:text-red-500">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-brand-blue-800">{s.nom}</p>
                <p className="text-sm text-brand-blue-400">{s.duree_minutes} min</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-brand-blue-900">{s.prix_chf} CHF</span>
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="text-brand-blue-400 hover:text-brand-orange-500"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
