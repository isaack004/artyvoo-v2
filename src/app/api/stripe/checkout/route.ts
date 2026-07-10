import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getArtisanByProfileId } from "@/lib/artisans";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";

// Crée une session Stripe Checkout hébergée (pas d'Elements côté client) :
// mode "subscription" pour les 3 paliers d'abonnement, mode "setup" pour
// enregistrer un moyen de paiement sans engagement (pay-per-lead, cf.
// /api/rdv qui facture chaque nouveau lead au-delà du quota gratuit).
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const artisan = await getArtisanByProfileId(supabase, user.id);
  if (!artisan) return NextResponse.json({ error: "Profil artisan introuvable." }, { status: 404 });

  const body = await request.json();
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const customerParams = artisan.stripe_customer_id
    ? { customer: artisan.stripe_customer_id }
    : { customer_email: artisan.email || user.email || undefined };

  if (body.mode === "subscription") {
    const plan = body.plan as PlanId;
    const planConfig = PLANS[plan];
    if (!planConfig) return NextResponse.json({ error: "Palier inconnu." }, { status: 400 });
    const priceId = process.env[planConfig.priceEnv];
    if (!priceId) {
      return NextResponse.json(
        { error: `Palier non configuré côté serveur (variable ${planConfig.priceEnv} manquante).` },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...customerParams,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/espace-pro/abonnement?succes=1`,
      cancel_url: `${appUrl}/espace-pro/abonnement?annule=1`,
      metadata: { artisan_id: artisan.id, plan },
    });
    return NextResponse.json({ url: session.url });
  }

  if (body.mode === "pay_per_lead") {
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      ...customerParams,
      success_url: `${appUrl}/espace-pro/abonnement?succes=1`,
      cancel_url: `${appUrl}/espace-pro/abonnement?annule=1`,
      metadata: { artisan_id: artisan.id, pay_per_lead: "1" },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Mode inconnu." }, { status: 400 });
}
