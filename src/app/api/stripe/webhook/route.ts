import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

const LEADS_GRATUITS_MAX = 5;

// Depuis l'API Stripe utilisée par le SDK v22, current_period_end vit sur
// chaque SubscriptionItem plutôt que sur la Subscription elle-même.
function periodeFin(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  return item ? new Date(item.current_period_end * 1000).toISOString() : null;
}

// Webhook Stripe : gère les abonnements (checkout.session.completed en mode
// subscription) et le pay-per-lead (checkout.session.completed en mode
// setup, qui enregistre un moyen de paiement pour les charges hors-session
// facturées depuis /api/rdv). Utilise la clé service-role : ces colonnes ne
// sont jamais modifiables directement par le client via RLS.
export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature invalide : ${err instanceof Error ? err.message : "erreur inconnue"}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const artisanId = session.metadata?.artisan_id;
      if (!artisanId) break;

      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await admin.from("artisans").update({ stripe_customer_id: session.customer as string, compte_actif: true }).eq("id", artisanId);
        await admin.from("subscriptions").insert({
          artisan_id: artisanId,
          plan: session.metadata?.plan ?? null,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          statut: "active",
          periode_fin: periodeFin(subscription),
        });
      } else if (session.mode === "setup" && session.metadata?.pay_per_lead) {
        const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
        await admin
          .from("artisans")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_payment_method_id: setupIntent.payment_method as string,
            pay_per_lead_enabled: true,
            compte_actif: true,
          })
          .eq("id", artisanId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const statut = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";
      await admin
        .from("subscriptions")
        .update({ statut, periode_fin: periodeFin(subscription) })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: sub } = await admin
        .from("subscriptions")
        .update({ statut: "canceled" })
        .eq("stripe_subscription_id", subscription.id)
        .select("artisan_id")
        .maybeSingle();

      if (sub) {
        const { data: artisan } = await admin
          .from("artisans")
          .select("leads_gratuits_utilises, pay_per_lead_enabled")
          .eq("id", sub.artisan_id)
          .maybeSingle();
        if (artisan && !artisan.pay_per_lead_enabled && artisan.leads_gratuits_utilises > LEADS_GRATUITS_MAX) {
          await admin.from("artisans").update({ compte_actif: false }).eq("id", sub.artisan_id);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      if (subscriptionRef) {
        const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
        await admin.from("subscriptions").update({ statut: "past_due" }).eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
