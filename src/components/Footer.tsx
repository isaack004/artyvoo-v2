import Link from "next/link";
import Logo from "./Logo";
import { METIERS, CANTONS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-blue-100 bg-brand-blue-900 text-brand-blue-100">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo className="mb-3 [&_span:first-child]:bg-white [&_span:first-child]:text-brand-blue-700" />
          <p className="text-sm text-brand-blue-200">
            La plateforme qui met en relation particuliers et artisans en Suisse romande.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Métiers</h3>
          <ul className="space-y-2 text-sm">
            {METIERS.map((m) => (
              <li key={m.slug}>
                <Link href={`/recherche?metier=${m.slug}`} className="hover:text-brand-orange-400">
                  {m.pluriel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Cantons couverts</h3>
          <ul className="space-y-2 text-sm">
            {CANTONS.map((c) => (
              <li key={c.code}>
                <Link href={`/recherche?canton=${c.code}`} className="hover:text-brand-orange-400">
                  {c.nom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Artyvoo</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/devenir-artisan" className="hover:text-brand-orange-400">Devenir partenaire</Link></li>
            <li><Link href="/connexion" className="hover:text-brand-orange-400">Connexion</Link></li>
            <li><Link href="/inscription" className="hover:text-brand-orange-400">Créer un compte</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-blue-800 py-4 text-center text-xs text-brand-blue-300">
        © {new Date().getFullYear()} Artyvoo — Suisse romande (GE · VD · JU · BE · VS)
      </div>
    </footer>
  );
}
