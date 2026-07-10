import Stripe from "stripe";

// Client Stripe serveur uniquement (STRIPE_SECRET_KEY ne doit jamais être
// exposée au client). Utilisé par /api/stripe/checkout et /api/stripe/webhook.
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const PLANS = {
  starter: { nom: "Starter", prixChf: 69, priceEnv: "STRIPE_PRICE_STARTER" },
  pro: { nom: "Pro", prixChf: 99, priceEnv: "STRIPE_PRICE_PRO" },
  business: { nom: "Business", prixChf: 149, priceEnv: "STRIPE_PRICE_BUSINESS" },
} as const;

export type PlanId = keyof typeof PLANS;

export const PRIX_LEAD_CHF = 18;
