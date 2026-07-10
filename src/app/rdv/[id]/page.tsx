import { notFound } from "next/navigation";
import { getArtisanById } from "@/lib/mockData";
import BookingFlow from "@/components/BookingFlow";

export default function RdvPage({ params }: { params: { id: string } }) {
  const artisan = getArtisanById(params.id);
  if (!artisan) notFound();

  return <BookingFlow artisan={artisan} />;
}
