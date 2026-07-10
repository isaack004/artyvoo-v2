import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function InscriptionPage() {
  return (
    <div className="container-page py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-blue-900">Créer un compte</h1>
      <p className="mb-6 text-center text-sm text-brand-blue-500">
        Vous êtes artisan ?{" "}
        <Link href="/inscription/artisan" className="font-semibold text-brand-orange-500">
          Inscrivez votre entreprise ici
        </Link>
      </p>
      <AuthForm mode="inscription-particulier" />
      <p className="mt-4 text-center text-sm text-brand-blue-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-orange-500">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
