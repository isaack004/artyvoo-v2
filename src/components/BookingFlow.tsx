"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ChevronLeft } from "lucide-react";
import { Artisan } from "@/lib/types";
import { getCreneauxDemo } from "@/lib/mockData";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return `${JOURS[(d.getDay() + 6) % 7]} ${d.getDate()} ${d.toLocaleDateString("fr-CH", {
    month: "long",
  })}`;
}

export default function BookingFlow({ artisan }: { artisan: Artisan }) {
  const router = useRouter();
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [heure, setHeure] = useState<string>("");
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    notes: "",
  });
  const [envoi, setEnvoi] = useState(false);

  const creneaux = useMemo(() => getCreneauxDemo(), []);
  const service = artisan.services.find((s) => s.id === serviceId);

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    // TODO: remplacer par un insert Supabase dans la table `appointments`
    // (voir supabase/schema.sql) une fois le projet connecté.
    const params = new URLSearchParams({
      artisan: artisan.entreprise,
      service: service?.nom ?? "",
      date,
      heure,
      nom: form.nom,
    });
    setTimeout(() => {
      router.push(`/rdv/confirmation?${params.toString()}`);
    }, 500);
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-6 flex items-center gap-3 text-sm text-brand-blue-500">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                etape >= n ? "bg-brand-orange-500 text-white" : "bg-brand-blue-50 text-brand-blue-400"
              }`}
            >
              {etape > n ? <Check size={14} /> : n}
            </span>
            {n < 3 && <span className="h-px w-8 bg-brand-blue-100" />}
          </div>
        ))}
      </div>

      <h1 className="mb-1 text-2xl font-bold text-brand-blue-900">
        Prendre rendez-vous avec {artisan.entreprise}
      </h1>
      <p className="mb-8 text-brand-blue-500">{artisan.ville} · {artisan.nom}</p>

      {etape === 1 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-brand-blue-800">1. Choisissez une prestation</h2>
          {artisan.services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServiceId(s.id);
                setEtape(2);
              }}
              className={`card flex w-full items-center justify-between p-4 text-left ${
                serviceId === s.id ? "border-brand-orange-400" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-brand-blue-800">{s.nom}</p>
                <p className="text-sm text-brand-blue-400">{s.duree_minutes} min</p>
              </div>
              <span className="font-bold text-brand-blue-900">{s.prix_chf} CHF</span>
            </button>
          ))}
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
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-blue-800">
            <CalendarDays size={18} /> 2. Choisissez un créneau
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {creneaux.map((c) => (
              <div key={c.date} className="card p-4">
                <p className="mb-2 text-sm font-semibold text-brand-blue-800">
                  {formatDateLabel(c.date)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.heures.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setDate(c.date);
                        setHeure(h);
                        setEtape(3);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${
                        date === c.date && heure === h
                          ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600"
                          : "border-brand-blue-100 text-brand-blue-600 hover:border-brand-orange-300"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
          <h2 className="mb-4 font-semibold text-brand-blue-800">3. Vos coordonnées</h2>

          <div className="card mb-4 p-4 text-sm text-brand-blue-600">
            <p>
              <strong>{service?.nom}</strong> · {service?.prix_chf} CHF
            </p>
            <p>
              {formatDateLabel(date)} à {heure}
            </p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-3">
            <input
              required
              placeholder="Nom complet"
              className="input-field"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Adresse e-mail"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              required
              type="tel"
              placeholder="Téléphone"
              className="input-field"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <input
              required
              placeholder="Adresse d'intervention"
              className="input-field"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            />
            <textarea
              placeholder="Précisions sur votre demande (optionnel)"
              className="input-field"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button type="submit" disabled={envoi} className="btn-primary w-full">
              {envoi ? "Confirmation en cours..." : "Confirmer le rendez-vous"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
