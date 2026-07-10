import { notFound } from "next/navigation";
import { getArtisanById } from "@/lib/artisans";
import { createClient } from "@/lib/supabase/server";
import BookingFlow from "@/components/BookingFlow";

export default async function RdvPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { date?: string; heure?: string };
}) {
  const artisan = await getArtisanById(createClient(), params.id);
  if (!artisan) notFound();

  return <BookingFlow artisan={artisan} initialDate={searchParams.date} initialHeure={searchParams.heure} />;
}
