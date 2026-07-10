import Link from "next/link";
import { METIERS } from "@/lib/constants";
import MetierIcon from "./MetierIcon";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {METIERS.map((m) => (
        <Link
          key={m.slug}
          href={`/recherche?metier=${m.slug}`}
          className="card group flex flex-col items-center gap-3 p-6 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-50 text-brand-orange-500 transition group-hover:bg-brand-orange-500 group-hover:text-white">
            <MetierIcon nom={m.icone} size={26} />
          </span>
          <span className="font-semibold text-brand-blue-800">{m.pluriel}</span>
          <span className="text-xs text-brand-blue-400">{m.description}</span>
        </Link>
      ))}
    </div>
  );
}
