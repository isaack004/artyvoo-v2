import { createClient } from "@/lib/supabase/server";
import { accepterArtisan, refuserArtisan } from "./actions";

type ArtisanEnAttente = {
  id: string;
  entreprise: string;
  metier: string;
  canton: string;
  ville: string;
  ide_number: string | null;
  telephone: string | null;
  email: string | null;
};

export default async function AdminArtisansPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("artisans")
    .select("id, entreprise, metier, canton, ville, ide_number, telephone, email")
    .eq("valide", false)
    .order("created_at");
  const enAttente = (data ?? []) as ArtisanEnAttente[];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-brand-blue-900">Artisans en attente de validation</h2>

      {enAttente.length === 0 ? (
        <p className="text-sm text-brand-blue-400">Aucune inscription en attente.</p>
      ) : (
        <div className="card divide-y divide-brand-blue-50 p-2">
          {enAttente.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-brand-blue-800">{a.entreprise}</p>
                <p className="text-sm text-brand-blue-500">
                  {a.metier} · {a.ville} ({a.canton})
                </p>
                <p className="text-sm text-brand-blue-400">
                  {a.telephone} · {a.email}
                </p>
                <p className="text-sm text-brand-blue-400">IDE : {a.ide_number ?? "non renseigné"}</p>
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await accepterArtisan(a.id);
                  }}
                >
                  <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                    Accepter
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await refuserArtisan(a.id);
                  }}
                >
                  <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">
                    Refuser
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
