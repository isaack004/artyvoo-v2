import { Resend } from "resend";

// Notifications de rendez-vous. Utilisé uniquement côté serveur (route
// /api/rdv) : RESEND_API_KEY ne doit jamais être exposée au client.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Artyvoo <rdv@artyvoo.ch>";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" });
}

export async function sendClientConfirmation(params: {
  clientEmail: string;
  clientNom: string;
  artisanEntreprise: string;
  date: string;
  heure: string;
  adresseIntervention: string;
}) {
  const { clientEmail, clientNom, artisanEntreprise, date, heure, adresseIntervention } = params;
  await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Rendez-vous confirmé avec ${artisanEntreprise}`,
    html: `
      <p>Bonjour ${clientNom},</p>
      <p>Votre rendez-vous avec <strong>${artisanEntreprise}</strong> est enregistré :</p>
      <ul>
        <li><strong>Date :</strong> ${formatDate(date)} à ${heure}</li>
        <li><strong>Adresse d'intervention :</strong> ${adresseIntervention}</li>
      </ul>
      <p>L'artisan vous contactera si besoin pour confirmer les détails.</p>
      <p>— L'équipe Artyvoo</p>
    `,
  });
}

export async function sendArtisanNotification(params: {
  artisanEmail: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  date: string;
  heure: string;
  adresseIntervention: string;
  description?: string;
}) {
  const { artisanEmail, clientNom, clientEmail, clientTelephone, date, heure, adresseIntervention, description } =
    params;
  await getResend().emails.send({
    from: FROM,
    to: artisanEmail,
    subject: `Nouveau rendez-vous : ${clientNom} le ${formatDate(date)}`,
    html: `
      <p>Vous avez un nouveau rendez-vous :</p>
      <ul>
        <li><strong>Client :</strong> ${clientNom}</li>
        <li><strong>Téléphone :</strong> ${clientTelephone}</li>
        <li><strong>E-mail :</strong> ${clientEmail}</li>
        <li><strong>Date :</strong> ${formatDate(date)} à ${heure}</li>
        <li><strong>Adresse d'intervention :</strong> ${adresseIntervention}</li>
      </ul>
      ${description ? `<p><strong>Description du problème :</strong> ${description}</p>` : ""}
      <p>Retrouvez ce rendez-vous dans votre agenda Artyvoo.</p>
    `,
  });
}
