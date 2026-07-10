import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/AdminNav";

// Défense en profondeur : middleware.ts redirige déjà les visiteurs non
// connectés vers /connexion pour /admin/*, mais seul ce layout vérifie le
// rôle (une session valide ne suffit pas à être admin).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="container-page space-y-6 py-10">
      <h1 className="text-2xl font-bold text-brand-blue-900">Administration</h1>
      <AdminNav />
      {children}
    </div>
  );
}
