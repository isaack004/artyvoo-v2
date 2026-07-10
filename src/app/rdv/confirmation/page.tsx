import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { artisan?: string; service?: string; date?: string; heure?: string; nom?: string };
}) {
  const { artisan, service, date, heure, nom } = searchParams;

  return (
    <div className="container-page flex max-w-lg flex-col items-center gap-4 py-20 text-center">
      <CheckCircle2 className="text-brand-orange-500" size={56} />
      <h1 className="text-2xl font-bold text-brand-blue-900">Rendez-vous confirmé !</h1>
      {nom && <p className="text-brand-blue-600">Merci {nom}, votre demande a bien été envoyée.</p>}

      <div className="card w-full p-6 text-left text-sm text-brand-blue-600">
        {artisan && (
          <p>
            <strong>Artisan :</strong> {artisan}
          </p>
        )}
        {service && (
          <p>
            <strong>Prestation :</strong> {service}
          </p>
        )}
        {date && heure && (
          <p>
            <strong>Créneau :</strong> {new Date(date).toLocaleDateString("fr-CH", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })} à {heure}
          </p>
        )}
        <p className="mt-3 text-brand-blue-400">
          Un e-mail de confirmation vous sera envoyé dès que l'artisan aura validé le créneau.
        </p>
      </div>

      <Link href="/" className="btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
}
