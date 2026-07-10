"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureVille, fetchCantons, fetchVilles, type Canton, type Ville } from "@/lib/regions";
import { METIERS } from "@/lib/constants";

const SPECIALITES_SUGGEREES = ["Urgences", "Dimanche et jours fériés", "Canalisation", "Installation", "Rénovation", "Dépannage rapide"];

const IDE_REGEX = /^CHE-\d{3}\.\d{3}\.\d{3}$/;

export default function ArtisanOnboardingForm() {
  const router = useRouter();
  const supabase = createClient();

  const [entreprise, setEntreprise] = useState("");
  const [metier, setMetier] = useState("");
  const [ideNumber, setIdeNumber] = useState("");
  const [bio, setBio] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [anneesExperience, setAnneesExperience] = useState("");
  const [specialites, setSpecialites] = useState<string[]>([]);

  const [canton, setCanton] = useState("");
  const [ville, setVille] = useState("");
  const [cantons, setCantons] = useState<Canton[]>([]);

  const [couvertureCantonEntier, setCouvertureCantonEntier] = useState(true);
  const [villesCouverture, setVillesCouverture] = useState<string[]>([]);
  const [villesDisponibles, setVillesDisponibles] = useState<Ville[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCantons(supabase).then(setCantons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!canton) {
      setVillesDisponibles([]);
      return;
    }
    fetchVilles(supabase, canton).then(setVillesDisponibles);
    setVillesCouverture([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canton]);

  function toggleSpecialite(s: string) {
    setSpecialites((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function toggleVilleCouverture(id: string) {
    setVillesCouverture((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (ideNumber && !IDE_REGEX.test(ideNumber)) {
      setError("Le numéro IDE doit être au format CHE-123.456.789.");
      return;
    }
    if (!couvertureCantonEntier && villesCouverture.length === 0) {
      setError("Sélectionnez au moins une ville de couverture, ou choisissez « tout le canton ».");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée, reconnectez-vous.");

      const villeCreee = await ensureVille(supabase, canton, ville.trim());

      const { data: artisan, error: insertError } = await supabase
        .from("artisans")
        .insert({
          profile_id: user.id,
          entreprise,
          metier,
          canton,
          ville: villeCreee.nom,
          adresse,
          bio,
          telephone,
          email: user.email,
          annees_experience: Number(anneesExperience) || 0,
          urgence_disponible: specialites.includes("Urgences"),
          ide_number: ideNumber || null,
          specialites,
          couverture_canton_entier: couvertureCantonEntier,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      if (!couvertureCantonEntier && villesCouverture.length > 0) {
        const { error: villesError } = await supabase
          .from("artisan_villes")
          .insert(villesCouverture.map((villeId) => ({ artisan_id: artisan.id, ville_id: villeId })));
        if (villesError) throw villesError;
      }

      router.push("/espace-pro");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-2xl space-y-5 p-6">
      <div>
        <h2 className="mb-1 text-lg font-bold text-brand-blue-900">Votre entreprise</h2>
        <p className="mb-4 text-sm text-brand-blue-500">
          Ces informations serviront à créer votre fiche publique. Notre équipe valide chaque
          profil avant sa mise en ligne.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Nom de l'entreprise"
          className="input-field"
          value={entreprise}
          onChange={(e) => setEntreprise(e.target.value)}
        />
        <select required value={metier} onChange={(e) => setMetier(e.target.value)} className="input-field">
          <option value="">Métier</option>
          {METIERS.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          type="tel"
          placeholder="Téléphone professionnel"
          className="input-field"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />
        <input
          type="number"
          min={0}
          placeholder="Années d'expérience"
          className="input-field"
          value={anneesExperience}
          onChange={(e) => setAnneesExperience(e.target.value)}
        />
      </div>

      <input
        required
        placeholder="Adresse (rue, numéro, NPA)"
        className="input-field"
        value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
      />

      <textarea
        required
        placeholder="Présentez votre activité en quelques phrases"
        rows={3}
        className="input-field"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div>
        <input
          placeholder="Numéro IDE (format CHE-123.456.789, optionnel)"
          className="input-field"
          value={ideNumber}
          onChange={(e) => setIdeNumber(e.target.value)}
        />
        <p className="mt-1 text-xs text-brand-blue-400">
          Utilisé pour la vérification anti-fraude par notre équipe avant validation de votre profil.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-brand-blue-800">Spécialités</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALITES_SUGGEREES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialite(s)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                specialites.includes(s)
                  ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600"
                  : "border-brand-blue-100 text-brand-blue-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-brand-blue-800">Localisation</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            required
            value={canton}
            onChange={(e) => {
              setCanton(e.target.value);
              setVille("");
            }}
            className="input-field"
          >
            <option value="">Canton de base</option>
            {cantons.map((c) => (
              <option key={c.code} value={c.code}>
                {c.nom}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Ville"
            className="input-field"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            disabled={!canton}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-brand-blue-800">Zone de couverture</h3>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-brand-blue-700">
            <input
              type="radio"
              checked={couvertureCantonEntier}
              onChange={() => setCouvertureCantonEntier(true)}
              className="accent-brand-orange-500"
            />
            J'interviens dans tout mon canton de base
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-blue-700">
            <input
              type="radio"
              checked={!couvertureCantonEntier}
              onChange={() => setCouvertureCantonEntier(false)}
              className="accent-brand-orange-500"
            />
            Je choisis des villes précises
          </label>
        </div>
        {!couvertureCantonEntier && (
          <div className="flex flex-wrap gap-2">
            {!canton && <p className="text-sm text-brand-blue-400">Choisissez d&apos;abord un canton de base.</p>}
            {villesDisponibles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleVilleCouverture(v.id)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  villesCouverture.includes(v.id)
                    ? "border-brand-orange-400 bg-brand-orange-50 text-brand-orange-600"
                    : "border-brand-blue-100 text-brand-blue-600"
                }`}
              >
                {v.nom}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création en cours..." : "Créer ma fiche artisan"}
      </button>
    </form>
  );
}
