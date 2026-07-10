import { Artisan, RendezVous } from "./types";

// Données de démonstration affichées tant que le projet n'est pas
// connecté à Supabase (voir supabase/schema.sql + README.md).
export const ARTISANS: Artisan[] = [
  {
    id: "1",
    nom: "Marco Ferreira",
    entreprise: "Ferreira Sanitaire",
    metier: "plombier",
    canton: "GE",
    ville: "Genève",
    adresse: "Rue du Rhône 12, 1204 Genève",
    note_moyenne: 4.8,
    nombre_avis: 132,
    bio: "Plombier indépendant depuis 12 ans, spécialisé dans les dépannages d'urgence et la rénovation de salles de bain.",
    annees_experience: 12,
    urgence_disponible: true,
    telephone: "+41 22 345 67 89",
    email: "contact@ferreira-sanitaire.ch",
    services: [
      { id: "s1", nom: "Diagnostic fuite d'eau", duree_minutes: 30, prix_chf: 90 },
      { id: "s2", nom: "Débouchage canalisation", duree_minutes: 60, prix_chf: 150 },
      { id: "s3", nom: "Installation chauffe-eau", duree_minutes: 120, prix_chf: 380 },
    ],
    avis: [
      { id: "a1", auteur: "Sophie L.", note: 5, commentaire: "Très rapide et efficace, je recommande !", date: "2026-06-02" },
      { id: "a2", auteur: "Jean-Marc D.", note: 4, commentaire: "Bon travail, ponctuel.", date: "2026-05-18" },
    ],
  },
  {
    id: "2",
    nom: "Élodie Rossier",
    entreprise: "Rossier Élec",
    metier: "electricien",
    canton: "VD",
    ville: "Lausanne",
    adresse: "Avenue de la Gare 5, 1003 Lausanne",
    note_moyenne: 4.9,
    nombre_avis: 87,
    bio: "Électricienne diplômée, mise aux normes NIBT et installations domotiques.",
    annees_experience: 9,
    urgence_disponible: true,
    telephone: "+41 21 456 78 90",
    email: "elodie@rossier-elec.ch",
    services: [
      { id: "s4", nom: "Dépannage panne électrique", duree_minutes: 45, prix_chf: 110 },
      { id: "s5", nom: "Mise aux normes tableau électrique", duree_minutes: 180, prix_chf: 620 },
      { id: "s6", nom: "Installation prise / luminaire", duree_minutes: 30, prix_chf: 80 },
    ],
    avis: [
      { id: "a3", auteur: "Nicolas B.", note: 5, commentaire: "Impeccable, très professionnelle.", date: "2026-06-20" },
    ],
  },
  {
    id: "3",
    nom: "Karim Benali",
    entreprise: "Benali Serrurerie 24/7",
    metier: "serrurier",
    canton: "GE",
    ville: "Carouge",
    adresse: "Rue Ancienne 45, 1227 Carouge",
    note_moyenne: 4.6,
    nombre_avis: 210,
    bio: "Ouverture de porte, blindage, remplacement de cylindre. Interventions rapides 7j/7.",
    annees_experience: 15,
    urgence_disponible: true,
    telephone: "+41 22 987 65 43",
    email: "karim@benali-serrurerie.ch",
    services: [
      { id: "s7", nom: "Ouverture de porte claquée", duree_minutes: 30, prix_chf: 120 },
      { id: "s8", nom: "Changement de cylindre", duree_minutes: 30, prix_chf: 95 },
      { id: "s9", nom: "Blindage de porte", duree_minutes: 240, prix_chf: 890 },
    ],
    avis: [
      { id: "a4", auteur: "Anaïs P.", note: 5, commentaire: "Venu en 20 minutes un dimanche, top !", date: "2026-04-11" },
    ],
  },
  {
    id: "4",
    nom: "Thierry Chappuis",
    entreprise: "Chappuis Chauffage & Sanitaire",
    metier: "chauffagiste",
    canton: "VS",
    ville: "Sion",
    adresse: "Route de Lausanne 20, 1950 Sion",
    note_moyenne: 4.7,
    nombre_avis: 64,
    bio: "Entretien et dépannage de chaudières, pompes à chaleur, spécialiste énergies renouvelables.",
    annees_experience: 18,
    urgence_disponible: false,
    telephone: "+41 27 322 11 22",
    email: "info@chappuis-chauffage.ch",
    services: [
      { id: "s10", nom: "Entretien annuel chaudière", duree_minutes: 90, prix_chf: 220 },
      { id: "s11", nom: "Dépannage pompe à chaleur", duree_minutes: 90, prix_chf: 260 },
    ],
    avis: [
      { id: "a5", auteur: "Fabienne G.", note: 5, commentaire: "Très sérieux, conseils clairs.", date: "2026-03-29" },
    ],
  },
  {
    id: "5",
    nom: "Julien Maradan",
    entreprise: "Maradan Paysage",
    metier: "jardinier",
    canton: "VD",
    ville: "Nyon",
    adresse: "Chemin des Vignes 8, 1260 Nyon",
    note_moyenne: 4.9,
    nombre_avis: 51,
    bio: "Création et entretien de jardins, taille de haies, élagage.",
    annees_experience: 7,
    urgence_disponible: false,
    telephone: "+41 22 654 32 10",
    email: "julien@maradan-paysage.ch",
    services: [
      { id: "s12", nom: "Entretien de jardin (forfait)", duree_minutes: 120, prix_chf: 180 },
      { id: "s13", nom: "Taille de haie", duree_minutes: 90, prix_chf: 140 },
    ],
    avis: [
      { id: "a6", auteur: "Isabelle R.", note: 5, commentaire: "Jardin transformé, très satisfait.", date: "2026-05-02" },
    ],
  },
  {
    id: "6",
    nom: "Nicolas Girard",
    entreprise: "Girard Plomberie",
    metier: "plombier",
    canton: "JU",
    ville: "Delémont",
    adresse: "Rue du 23-Juin 15, 2800 Delémont",
    note_moyenne: 4.5,
    nombre_avis: 38,
    bio: "Plombier polyvalent, dépannage et installation sanitaire pour particuliers et régies.",
    annees_experience: 10,
    urgence_disponible: true,
    telephone: "+41 32 421 33 44",
    email: "contact@girard-plomberie.ch",
    services: [
      { id: "s14", nom: "Dépannage fuite d'eau", duree_minutes: 45, prix_chf: 100 },
      { id: "s15", nom: "Installation sanitaire", duree_minutes: 150, prix_chf: 450 },
    ],
    avis: [
      { id: "a7", auteur: "Marc T.", note: 4, commentaire: "Bon rapport qualité-prix.", date: "2026-02-14" },
    ],
  },
  {
    id: "7",
    nom: "Sandra Wyss",
    entreprise: "Wyss Électricité",
    metier: "electricien",
    canton: "BE",
    ville: "Bienne",
    adresse: "Rue de Nidau 22, 2502 Bienne",
    note_moyenne: 4.8,
    nombre_avis: 72,
    bio: "Installations électriques neuves et rénovation, bilingue français/allemand.",
    annees_experience: 14,
    urgence_disponible: true,
    telephone: "+41 32 123 45 67",
    email: "sandra@wyss-elec.ch",
    services: [
      { id: "s16", nom: "Dépannage panne électrique", duree_minutes: 45, prix_chf: 115 },
      { id: "s17", nom: "Rénovation installation électrique", duree_minutes: 240, prix_chf: 950 },
    ],
    avis: [
      { id: "a8", auteur: "Pierre A.", note: 5, commentaire: "Excellent travail, très pro.", date: "2026-06-10" },
    ],
  },
];

export function getArtisanById(id: string) {
  return ARTISANS.find((a) => a.id === id);
}

export function searchArtisans(params: { metier?: string; canton?: string; ville?: string }) {
  return ARTISANS.filter((a) => {
    if (params.metier && a.metier !== params.metier) return false;
    if (params.canton && a.canton !== params.canton) return false;
    if (params.ville && a.ville.toLowerCase() !== params.ville.toLowerCase()) return false;
    return true;
  });
}

// Génère des créneaux de démo pour les 14 prochains jours (jours ouvrés, 08:00-17:30)
export function getCreneauxDemo(dateDebut: Date = new Date()) {
  const creneaux: { date: string; heures: string[] }[] = [];
  const heuresBase = ["08:00", "09:00", "10:30", "13:30", "15:00", "16:30"];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(dateDebut);
    d.setDate(d.getDate() + i);
    const jour = d.getDay();
    if (jour === 0 || jour === 6) continue; // pas de week-end en démo
    const iso = d.toISOString().slice(0, 10);
    // retire aléatoirement 1-2 créneaux pour simuler des réservations existantes
    const heures = heuresBase.filter(() => Math.random() > 0.2);
    if (heures.length > 0) creneaux.push({ date: iso, heures });
  }
  return creneaux;
}

// Rendez-vous de démo pour l'espace pro (artisan id "1" = Marco Ferreira)
export const RDV_DEMO: RendezVous[] = [
  {
    id: "rdv1",
    artisan_id: "1",
    service_id: "s1",
    client_nom: "Claire Dupont",
    client_email: "claire.dupont@email.ch",
    client_telephone: "+41 79 123 45 67",
    adresse_intervention: "Rue de Lyon 4, 1201 Genève",
    date: "2026-07-13",
    heure: "09:00",
    statut: "confirme",
  },
  {
    id: "rdv2",
    artisan_id: "1",
    service_id: "s2",
    client_nom: "Hugo Meier",
    client_email: "hugo.meier@email.ch",
    client_telephone: "+41 79 234 56 78",
    adresse_intervention: "Avenue de Champel 10, 1206 Genève",
    date: "2026-07-14",
    heure: "13:30",
    statut: "en_attente",
  },
  {
    id: "rdv3",
    artisan_id: "1",
    service_id: "s3",
    client_nom: "Léa Bertrand",
    client_email: "lea.bertrand@email.ch",
    client_telephone: "+41 79 345 67 89",
    adresse_intervention: "Rue des Eaux-Vives 55, 1207 Genève",
    date: "2026-07-08",
    heure: "10:30",
    statut: "termine",
  },
];
