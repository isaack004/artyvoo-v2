import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendClientConfirmation, sendArtisanNotification } from "@/lib/email";
import { getStripe, PRIX_LEAD_CHF } from "@/lib/stripe";

const LEADS_GRATUITS_MAX = 5;

// Point d'entrée unique pour la confirmation d'un rendez-vous, utilisé par
// BookingFlow.tsx (fiche artisan) et ReservationFlow.tsx (/reserver).
// L'inscription/connexion est obligatoire avant d'appeler cette route (RLS
// autorise techniquement l'insertion anonyme, mais la règle produit
// "inscription obligatoire" est appliquée ici).
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Connexion requise pour confirmer un rendez-vous." }, { status: 401 });
  }

  const body = await request.json();
  const { artisanId, serviceId, date, heure, adresseIntervention, description, clientNom, clientTelephone } = body;

  if (!artisanId || !serviceId || !date || !heure || !adresseIntervention || !clientNom || !clientTelephone) {
    return NextResponse.json({ error: "Merci de compléter tous les champs." }, { status: 400 });
  }

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      artisan_id: artisanId,
      service_id: serviceId,
      client_id: user.id,
      client_nom: clientNom,
      client_email: user.email,
      client_telephone: clientTelephone,
      adresse_intervention: adresseIntervention,
      date,
      heure,
      notes: description || null,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Compteur de leads gratuits + bascule compte_actif : colonnes non
  // modifiables par le client via RLS, on utilise donc la clé service-role.
  const admin = createAdminClient();
  const { data: artisan } = await admin
    .from("artisans")
    .select(
      "entreprise, email, leads_gratuits_utilises, pay_per_lead_enabled, stripe_customer_id, stripe_payment_method_id"
    )
    .eq("id", artisanId)
    .maybeSingle();

  if (artisan) {
    const { count: abonnementActif } = await admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("artisan_id", artisanId)
      .eq("statut", "active");

    const nouveauCompteur = (artisan.leads_gratuits_utilises ?? 0) + 1;
    const depasseQuotaGratuit = nouveauCompteur > LEADS_GRATUITS_MAX;
    let compteActif = Boolean(abonnementActif) || !depasseQuotaGratuit;

    // Pay-per-lead : facture ce lead hors-session via le moyen de paiement
    // enregistré (SetupIntent complété dans /api/stripe/checkout). Si la
    // charge échoue (carte refusée...), l'artisan repasse en "à activer"
    // comme s'il n'avait pas de moyen de paiement au lead.
    if (!abonnementActif && depasseQuotaGratuit && artisan.pay_per_lead_enabled) {
      if (artisan.stripe_customer_id && artisan.stripe_payment_method_id) {
        try {
          const stripe = getStripe();
          const paymentIntent = await stripe.paymentIntents.create({
            amount: PRIX_LEAD_CHF * 100,
            currency: "chf",
            customer: artisan.stripe_customer_id,
            payment_method: artisan.stripe_payment_method_id,
            off_session: true,
            confirm: true,
            metadata: { artisan_id: artisanId, appointment_id: appointment.id },
          });
          await admin.from("leads_paid").insert({
            artisan_id: artisanId,
            appointment_id: appointment.id,
            stripe_payment_intent_id: paymentIntent.id,
            montant_chf: PRIX_LEAD_CHF,
          });
          compteActif = true;
        } catch {
          compteActif = false;
        }
      } else {
        compteActif = false;
      }
    }

    await admin
      .from("artisans")
      .update({ leads_gratuits_utilises: nouveauCompteur, compte_actif: compteActif })
      .eq("id", artisanId);

    try {
      await Promise.all([
        sendClientConfirmation({
          clientEmail: user.email,
          clientNom,
          artisanEntreprise: artisan.entreprise,
          date,
          heure,
          adresseIntervention,
        }),
        artisan.email
          ? sendArtisanNotification({
              artisanEmail: artisan.email,
              clientNom,
              clientEmail: user.email,
              clientTelephone,
              date,
              heure,
              adresseIntervention,
              description,
            })
          : Promise.resolve(),
      ]);
    } catch {
      // L'échec d'envoi d'e-mail ne doit pas faire échouer la réservation,
      // déjà enregistrée en base à ce stade.
    }
  }

  return NextResponse.json({ id: appointment.id });
}
