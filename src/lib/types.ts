export type Service = {
  id: string;
  nom: string;
  duree_minutes: number;
  prix_chf: number;
  description?: string;
};

export type Avis = {
  id: string;
  auteur: string;
  note: number; // 1-5
  commentaire: string;
  date: string; // ISO
};

export type Artisan = {
  id: string;
  nom: string;
  entreprise: string;
  metier: string; // slug
  canton: string; // code
  ville: string;
  adresse: string;
  note_moyenne: number;
  nombre_avis: number;
  photo_url?: string;
  bio: string;
  services: Service[];
  avis: Avis[];
  urgence_disponible: boolean;
  annees_experience: number;
  telephone: string;
  email: string;
};

export type CreneauDisponible = {
  date: string; // ISO yyyy-MM-dd
  heures: string[]; // ["08:00", "08:30", ...]
};

export type StatutRdv = "en_attente" | "confirme" | "annule" | "termine";

export type RendezVous = {
  id: string;
  artisan_id: string;
  service_id: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  adresse_intervention: string;
  date: string; // ISO yyyy-MM-dd
  heure: string; // HH:mm
  statut: StatutRdv;
  notes?: string;
};
