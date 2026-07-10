import AuthForm from "@/components/AuthForm";
import { CheckCircle2 } from "lucide-react";

const AVANTAGES = [
  "Visibilité auprès des particuliers de votre canton",
  "Agenda en ligne synchronisé, fini les appels manqués",
  "Sans commission cachée sur vos interventions",
  "Profil avec avis clients pour renforcer votre réputation",
];

export default function InscriptionArtisanPage() {
  return (
    <div className="container-page grid gap-10 py-16 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-3xl font-extrabold text-brand-blue-900">
          Rejoignez Artyvoo en tant qu'artisan
        </h1>
        <p className="mb-6 text-brand-blue-600">
          Créez votre compte, complétez votre fiche entreprise, puis notre équipe valide votre
          profil avant sa mise en ligne.
        </p>
        <ul className="space-y-3">
          {AVANTAGES.map((a) => (
            <li key={a} className="flex items-start gap-2 text-brand-blue-700">
              <CheckCircle2 className="mt-0.5 shrink-0 text-brand-orange-500" size={20} />
              {a}
            </li>
          ))}
        </ul>
      </div>
      <AuthForm mode="inscription-artisan" />
    </div>
  );
}
