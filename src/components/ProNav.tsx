"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Wrench, Clock } from "lucide-react";

const LIENS = [
  { href: "/espace-pro", label: "Aperçu", icon: LayoutDashboard },
  { href: "/espace-pro/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/espace-pro/services", label: "Services", icon: Wrench },
  { href: "/espace-pro/disponibilites", label: "Disponibilités", icon: Clock },
];

export default function ProNav() {
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
              actif
                ? "bg-brand-blue-600 text-white"
                : "text-brand-blue-600 hover:bg-brand-blue-50"
            }`}
          >
            <l.icon size={16} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
