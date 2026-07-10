"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { METIERS } from "@/lib/constants";
import RegionPicker from "@/components/RegionPicker";

export default function SearchBar({
  defaultMetier = "",
  defaultCanton = "",
  defaultVille = "",
}: {
  defaultMetier?: string;
  defaultCanton?: string;
  defaultVille?: string;
}) {
  const router = useRouter();
  const [metier, setMetier] = useState(defaultMetier);
  const [canton, setCanton] = useState(defaultCanton);
  const [ville, setVille] = useState(defaultVille);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (canton) params.set("canton", canton);
    if (ville) params.set("ville", ville);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 shadow-card-hover sm:flex-row sm:items-center"
    >
      <select
        value={metier}
        onChange={(e) => setMetier(e.target.value)}
        className="input-field !border-none sm:flex-1"
      >
        <option value="">Quel métier recherchez-vous ?</option>
        {METIERS.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.nom}
          </option>
        ))}
      </select>
      <div className="hidden h-8 w-px bg-brand-blue-100 sm:block" />
      <RegionPicker
        canton={canton}
        ville={ville}
        onCantonChange={setCanton}
        onVilleChange={setVille}
        variant="inline"
      />
      <button type="submit" className="btn-primary w-full sm:w-auto">
        <Search size={18} />
        Rechercher
      </button>
    </form>
  );
}
