import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://artyvoo.ch"),
  title: "Artyvoo — Trouvez un artisan de confiance en Suisse romande",
  description:
    "Prenez rendez-vous en ligne avec des plombiers, électriciens, serruriers, chauffagistes et jardiniers en Suisse romande.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
