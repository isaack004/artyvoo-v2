"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, UserCheck, CreditCard } from "lucide-react";

const LIENS = [
  { href: "/admin", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/artisans", label: "Artisans en attente", icon: UserCheck },
  { href: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-brand-blue-100 pb-2">
      {LIENS.map((l) => {
        const actif = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              actif ? "bg-brand-blue-600 text-white" : "text-brand-blue-600 hover:bg-brand-blue-50"
            }`}
          >
            <l.icon size={16} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
