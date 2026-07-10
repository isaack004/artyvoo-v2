import type { SupabaseClient } from "@supabase/supabase-js";
import type { RendezVous, StatutRdv } from "./types";

// Remplace RDV_DEMO de src/lib/mockData.ts par de vraies requêtes sur la
// table appointments (voir supabase/schema.sql).

type AppointmentRow = {
  id: string;
  artisan_id: string;
  service_id: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  adresse_intervention: string;
  date: string;
  heure: string;
  statut: StatutRdv;
  notes: string | null;
};

function mapAppointmentRow(row: AppointmentRow): RendezVous {
  return {
    id: row.id,
    artisan_id: row.artisan_id,
    service_id: row.service_id,
    client_nom: row.client_nom,
    client_email: row.client_email,
    client_telephone: row.client_telephone,
    adresse_intervention: row.adresse_intervention,
    date: row.date,
    heure: row.heure,
    statut: row.statut,
    notes: row.notes ?? undefined,
  };
}

export async function getUpcomingAppointmentsForArtisan(
  supabase: SupabaseClient,
  artisanId: string
): Promise<RendezVous[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("artisan_id", artisanId)
    .gte("date", today)
    .order("date")
    .order("heure");
  if (error) throw error;
  return ((data as AppointmentRow[] | null) ?? []).map(mapAppointmentRow);
}

export async function getAllAppointmentsForArtisan(
  supabase: SupabaseClient,
  artisanId: string
): Promise<RendezVous[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("artisan_id", artisanId)
    .order("date")
    .order("heure");
  if (error) throw error;
  return ((data as AppointmentRow[] | null) ?? []).map(mapAppointmentRow);
}

export type RendezVousClient = RendezVous & {
  artisan_entreprise: string;
  artisan_ville: string;
  service_nom: string;
  service_prix_chf: number;
};

export async function getAppointmentsForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<RendezVousClient[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, artisans(entreprise, ville), services(nom, prix_chf)")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) throw error;

  type Row = AppointmentRow & {
    artisans: { entreprise: string; ville: string } | null;
    services: { nom: string; prix_chf: number } | null;
  };

  return ((data as unknown as Row[] | null) ?? []).map((row) => ({
    ...mapAppointmentRow(row),
    artisan_entreprise: row.artisans?.entreprise ?? "",
    artisan_ville: row.artisans?.ville ?? "",
    service_nom: row.services?.nom ?? "",
    service_prix_chf: row.services?.prix_chf ?? 0,
  }));
}
