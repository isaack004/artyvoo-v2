import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreneauDisponible } from "./types";

// Remplace getCreneauxDemo() de mockData.ts : calcule les créneaux réels à
// partir de disponibilites (récurrent hebdo), moins indisponibilites
// (congés), moins appointments déjà pris.

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAvailableSlots(
  supabase: SupabaseClient,
  artisanId: string,
  opts: { jours?: number; dureeMinutes?: number } = {}
): Promise<CreneauDisponible[]> {
  const jours = opts.jours ?? 14;
  const dureeMinutes = opts.dureeMinutes ?? 60;

  const debut = new Date();
  debut.setDate(debut.getDate() + 1);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + jours);
  const debutIso = debut.toISOString().slice(0, 10);
  const finIso = fin.toISOString().slice(0, 10);

  const [{ data: disponibilites }, { data: indisponibilites }, { data: appointments }] = await Promise.all([
    supabase.from("disponibilites").select("jour_semaine, heure_debut, heure_fin").eq("artisan_id", artisanId),
    supabase
      .from("indisponibilites")
      .select("date, heure_debut, heure_fin, toute_la_journee")
      .eq("artisan_id", artisanId)
      .gte("date", debutIso)
      .lte("date", finIso),
    // appointments n'a pas de policy RLS de lecture publique (voir migration
    // 0008) : on passe par une fonction security definer qui n'expose que
    // date/heure, sans données personnelles.
    supabase.rpc("get_booked_slots", { p_artisan_id: artisanId, p_from: debutIso, p_to: finIso }),
  ]);

  const dispoParJour = new Map<number, { debut: string; fin: string }[]>();
  for (const d of (disponibilites ?? []) as { jour_semaine: number; heure_debut: string; heure_fin: string }[]) {
    const list = dispoParJour.get(d.jour_semaine) ?? [];
    list.push({ debut: d.heure_debut.slice(0, 5), fin: d.heure_fin.slice(0, 5) });
    dispoParJour.set(d.jour_semaine, list);
  }

  const indispoParDate = new Map<string, { debut: string | null; fin: string | null; touteLaJournee: boolean }[]>();
  for (const i of (indisponibilites ?? []) as {
    date: string;
    heure_debut: string | null;
    heure_fin: string | null;
    toute_la_journee: boolean;
  }[]) {
    const list = indispoParDate.get(i.date) ?? [];
    list.push({
      debut: i.heure_debut?.slice(0, 5) ?? null,
      fin: i.heure_fin?.slice(0, 5) ?? null,
      touteLaJournee: i.toute_la_journee,
    });
    indispoParDate.set(i.date, list);
  }

  const prisParDate = new Map<string, Set<string>>();
  for (const a of (appointments ?? []) as { date: string; heure: string }[]) {
    const set = prisParDate.get(a.date) ?? new Set<string>();
    set.add(a.heure.slice(0, 5));
    prisParDate.set(a.date, set);
  }

  const creneaux: CreneauDisponible[] = [];
  for (let i = 0; i < jours; i++) {
    const d = new Date(debut);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const jourSemaine = (d.getDay() + 6) % 7; // 0 = lundi, cohérent avec le schéma

    const plages = dispoParJour.get(jourSemaine);
    if (!plages || plages.length === 0) continue;

    const indispoJour = indispoParDate.get(iso) ?? [];
    if (indispoJour.some((x) => x.touteLaJournee)) continue;

    const dejaPris = prisParDate.get(iso) ?? new Set<string>();

    const heures: string[] = [];
    for (const plage of plages) {
      for (let m = toMinutes(plage.debut); m + dureeMinutes <= toMinutes(plage.fin); m += dureeMinutes) {
        const heure = toHHMM(m);
        if (dejaPris.has(heure)) continue;
        const dansIndispo = indispoJour.some(
          (x) => !x.touteLaJournee && x.debut && x.fin && heure >= x.debut && heure < x.fin
        );
        if (dansIndispo) continue;
        heures.push(heure);
      }
    }
    if (heures.length > 0) creneaux.push({ date: iso, heures });
  }

  return creneaux;
}
