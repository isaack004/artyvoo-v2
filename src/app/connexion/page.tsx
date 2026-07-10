import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function ConnexionPage() {
  return (
    <div className="container-page py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-brand-blue-900">Connexion</h1>
      <AuthForm mode="connexion" />
      <p className="mt-4 text-center text-sm text-brand-blue-500">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-orange-500">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
