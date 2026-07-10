import Link from "next/link";
import { CalendarCheck, Users, Wallet, Star } from "lucide-react";
import { METIERS } from "@/lib/constants";

const POINTS = [
  { icon: Users, titre: "Plus de clients", texte: "Soyez visible auprès des particuliers de votre canton qui cherchent un artisan maintenant." },
  { icon: CalendarCheck, titre: "Agenda simplifié", texte: "Gérez vos disponibilités et vos rendez-vous en ligne, synchronisés en temps réel." },
  { icon: Wallet, titre: "Sans commission cachée", texte: "Un abonnement simple et transparent, vous gardez la maîtrise de vos tarifs." },
  { icon: Star, titre: "Réputation en ligne", texte: "Collectez des avis vérifiés qui valorisent votre travail." },
];

export default function DevenirArtisanPage() {
  return (
    <div>
      <section className="bg-brand-blue-900 py-16 text-white">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-extrabold">
            Développez votre activité d'artisan en Suisse romande
          </h1>
          <p className="max-w-xl text-brand-blue-200">
            Plombiers, électriciens, serruriers, chauffagistes, jardiniers : rejoignez Artyvoo et
            recevez des demandes de rendez-vous directement dans votre agenda.
          </p>
          <Link href="/inscription/artisan" className="btn-primary">
            Inscrire mon entreprise
          </Link>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <div key={p.titre} className="card p-6 text-center">
              <p.icon className="mx-auto mb-3 text-brand-orange-500" size={28} />
              <h3 className="mb-2 font-bold text-brand-blue-900">{p.titre}</h3>
              <p className="text-sm text-brand-blue-500">{p.texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <h2 className="mb-6 text-center text-xl font-bold text-brand-blue-900">
          Métiers représentés sur Artyvoo
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {METIERS.map((m) => (
            <span key={m.slug} className="rounded-full border border-brand-blue-100 px-4 py-2 text-sm text-brand-blue-700">
              {m.pluriel}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
