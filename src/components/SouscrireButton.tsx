"use client";

import { useState } from "react";

export default function SouscrireButton({
  mode,
  plan,
  label,
}: {
  mode: "subscription" | "pay_per_lead";
  plan?: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Impossible de démarrer le paiement.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className="btn-primary w-full">
        {loading ? "Redirection vers Stripe..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
