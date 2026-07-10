"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "connexion" | "inscription-particulier" | "inscription-artisan";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const role = mode === "inscription-artisan" ? "artisan" : "particulier";
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, prenom, nom } },
        });
        if (error) throw error;
        router.push(mode === "inscription-artisan" ? "/espace-pro" : "/espace-client");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Vérifiez que le projet Supabase est bien configuré (.env.local)."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-3 p-6">
      {mode !== "connexion" && (
        <div className="flex gap-3">
          <input
            required
            placeholder="Prénom"
            className="input-field"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          <input
            required
            placeholder="Nom"
            className="input-field"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
      )}
      <input
        required
        type="email"
        placeholder="Adresse e-mail"
        className="input-field"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        required
        type="password"
        minLength={6}
        placeholder="Mot de passe"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading
          ? "Chargement..."
          : mode === "connexion"
          ? "Se connecter"
          : "Créer mon compte"}
      </button>
    </form>
  );
}
