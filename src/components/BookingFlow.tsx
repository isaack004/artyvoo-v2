"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ChevronLeft } from "lucide-react";
import { Artisan, CreneauDisponible } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getAvailableSlots } from "@/lib/availability";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return `${JOURS[(d.getDay() + 6) % 7]} ${d.getDate()} ${d.toLocaleDateString("fr-CH", {
    month: "long",
  })}`;
}

type Etape = 1 | 2 | 3 | 4;
type ModeAuth = "connexion" | "inscription";

export default function BookingFlow({
  artisan,
  initialDate,
  initialHeure,
}: {
  artisan: Artisan;
  initialDate?: string;
  initialHeure?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [etape, setEtape] = useState<Etape>(1);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(initialDate ?? "");
  const [heure, setHeure] = useState<string>(initialHeure ?? "");
  const [creneaux, setCreneaux] = useState<CreneauDisponible[]>([]);
  const [chargementCreneaux, setChargementCreneaux] = useState(false);

  const [session, setSession] = useState<{ id: string; email: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [modeAuth, setModeAuth] = useState<ModeAuth>("connexion");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPrenom, setAuthPrenom] = useState("");
  const [authNom, setAuthNom] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [form, setForm] = useState({ nom: "", telephone: "", adresse: "", notes: "" });
  const [envoi, setEnvoi] = useState(false);
  const [envoiError, setEnvoiError] = useState<string | null>(null);

  const service = artisan.services.find((s) => s.id === serviceId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user ? { id: data.user.id, email: data.user.email ?? "" } : null);
      setCheckingSession(false);
    });
  }, [supabase]);

  useEffect(() => {
    if (etape === 3 && session) setEtape(4);
  }, [etape, session]);

  function handleChoisirService(id: string) {
    setServiceId(id);
    if (initialDate && initialHeure) {
      // Créneau déjà choisi depuis le parcours guidé (/reserver) : on saute
      // directement à l'étape suivante (auth-gate, ou coordonnées si déjà connecté).
      setEtape(checkingSession ? 3 : session ? 4 : 3);
      return;
    }
    setChargementCreneaux(true);
    getAvailableSlots(supabase, artisan.id)
      .then(setCreneaux)
      .finally(() => setChargementCreneaux(false));
    setEtape(2);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (modeAuth === "connexion") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setSession({ id: data.user.id, email: data.user.email ?? "" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { role: "particulier", prenom: authPrenom, nom: authNom } },
        });
        if (error) throw error;
        if (data.session && data.user) {
          setSession({ id: data.user.id, email: data.user.email ?? "" });
          setForm((f) => ({ ...f, nom: `${authPrenom} ${authNom}`.trim() }));
        } else {
          setAuthError(
            "Compte créé ! Vérifiez votre e-mail pour confirmer votre adresse, puis reconnectez-vous ici pour finaliser votre rendez-vous."
          );
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setEnvoiError(null);
    try {
      const res = await fetch("/api/rdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: artisan.id,
          serviceId,
          date,
          heure,
          adresseIntervention: form.adresse,
          description: form.notes,
          clientNom: form.nom,
          clientTelephone: form.telephone,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Impossible de confirmer le rendez-vous.");
      }
      const params = new URLSearchParams({
        artisan: artisan.entreprise,
        service: service?.nom ?? "",
        date,
        heure,
        nom: form.nom,
      });
      router.push(`/rdv/confirmation?${params.toString()}`);
    } catch (err) {
      setEnvoiError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setEnvoi(false);
    }
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-6 flex items-center gap-3 text-sm text-brand-blue-500">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                etape >= n ? "bg-brand-orange-500 text-white" : "bg-brand-blue-50 text-brand-blue-400"
              }`}
            >
              {etape > n ? <Check size={14} /> : n}
            </span>
            {n < 4 && <span className="h-px w-8 bg-brand-blue-100" />}
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
              onClick={() => handleChoisirService(s.id)}
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
          {chargementCreneaux ? (
            <p className="text-sm text-brand-blue-400">Chargement des créneaux disponibles...</p>
          ) : creneaux.length === 0 ? (
            <p className="text-sm text-brand-blue-400">
              Aucun créneau disponible pour le moment. Contactez directement l&apos;artisan.
            </p>
          ) : (
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
                          setEtape(checkingSession ? 2 : 3);
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
          )}
        </div>
      )}

      {etape === 3 && !session && (
        <div>
          <button
            onClick={() => setEtape(2)}
            className="mb-4 flex items-center gap-1 text-sm text-brand-blue-500 hover:text-brand-orange-500"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <h2 className="mb-4 font-semibold text-brand-blue-800">3. Connectez-vous pour confirmer</h2>
          <div className="mb-4 flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setModeAuth("connexion")}
              className={`rounded-full px-3 py-1 ${modeAuth === "connexion" ? "bg-brand-blue-600 text-white" : "text-brand-blue-600"}`}
            >
              J&apos;ai déjà un compte
            </button>
            <button
              type="button"
              onClick={() => setModeAuth("inscription")}
              className={`rounded-full px-3 py-1 ${modeAuth === "inscription" ? "bg-brand-blue-600 text-white" : "text-brand-blue-600"}`}
            >
              Créer un compte
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="card space-y-3 p-4">
            {modeAuth === "inscription" && (
              <div className="flex gap-3">
                <input
                  required
                  placeholder="Prénom"
                  className="input-field"
                  value={authPrenom}
                  onChange={(e) => setAuthPrenom(e.target.value)}
                />
                <input
                  required
                  placeholder="Nom"
                  className="input-field"
                  value={authNom}
                  onChange={(e) => setAuthNom(e.target.value)}
                />
              </div>
            )}
            <input
              required
              type="email"
              placeholder="Adresse e-mail"
              className="input-field"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
            <input
              required
              type="password"
              minLength={6}
              placeholder="Mot de passe"
              className="input-field"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button type="submit" disabled={authLoading} className="btn-primary w-full">
              {authLoading ? "Chargement..." : modeAuth === "connexion" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>
      )}

      {etape === 4 && (
        <div>
          <button
            onClick={() => setEtape(2)}
            className="mb-4 flex items-center gap-1 text-sm text-brand-blue-500 hover:text-brand-orange-500"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <h2 className="mb-4 font-semibold text-brand-blue-800">4. Vos coordonnées</h2>

          <div className="card mb-4 p-4 text-sm text-brand-blue-600">
            <p>
              <strong>{service?.nom}</strong> · {service?.prix_chf} CHF
            </p>
            <p>
              {formatDateLabel(date)} à {heure}
            </p>
            <p className="mt-1 text-brand-blue-400">Connecté en tant que {session?.email}</p>
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
              placeholder="Décrivez votre besoin (optionnel)"
              className="input-field"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            {envoiError && <p className="text-sm text-red-600">{envoiError}</p>}
            <button type="submit" disabled={envoi} className="btn-primary w-full">
              {envoi ? "Confirmation en cours..." : "Confirmer le rendez-vous"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
