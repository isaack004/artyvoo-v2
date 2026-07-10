import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-blue-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-blue-700 md:flex">
          <Link href="/recherche" className="hover:text-brand-orange-500">
            Trouver un artisan
          </Link>
          <Link href="/devenir-artisan" className="hover:text-brand-orange-500">
            Vous êtes artisan ?
          </Link>
          <Link href="/espace-client" className="hover:text-brand-orange-500">
            Mes rendez-vous
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/connexion" className="hidden text-sm font-semibold text-brand-blue-700 hover:text-brand-orange-500 sm:block">
            Connexion
          </Link>
          <Link href="/devenir-artisan" className="btn-primary !px-4 !py-2 text-sm">
            Inscrire mon entreprise
          </Link>
        </div>
      </div>
    </header>
  );
}
