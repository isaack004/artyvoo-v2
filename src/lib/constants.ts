export type Canton = {
  code: string;
  nom: string;
  villes: string[];
};

// Les 4 cantons (5 territoires) de Suisse romande couverts au lancement
export const CANTONS: Canton[] = [
  {
    code: "GE",
    nom: "Genève",
    villes: ["Genève", "Carouge", "Lancy", "Meyrin", "Vernier", "Onex", "Thônex"],
  },
  {
    code: "VD",
    nom: "Vaud",
    villes: ["Lausanne", "Yverdon-les-Bains", "Montreux", "Nyon", "Vevey", "Renens", "Morges"],
  },
  {
    code: "JU",
    nom: "Jura",
    villes: ["Delémont", "Porrentruy", "Saignelégier"],
  },
  {
    code: "BE",
    nom: "Berne (Jura bernois)",
    villes: ["Bienne", "Moutier", "Tavannes", "Saint-Imier"],
  },
  {
    code: "VS",
    nom: "Valais",
    villes: ["Sion", "Martigny", "Sierre", "Monthey", "Fully"],
  },
];

export type Metier = {
  slug: string;
  nom: string;
  pluriel: string;
  icone: string; // nom d'icône lucide-react
  description: string;
};

export const METIERS: Metier[] = [
  {
    slug: "plombier",
    nom: "Plombier",
    pluriel: "Plombiers",
    icone: "Wrench",
    description: "Fuites, sanitaires, chauffe-eau, débouchage",
  },
  {
    slug: "electricien",
    nom: "Électricien",
    pluriel: "Électriciens",
    icone: "Zap",
    description: "Installation, dépannage, mise aux normes",
  },
  {
    slug: "serrurier",
    nom: "Serrurier",
    pluriel: "Serruriers",
    icone: "KeyRound",
    description: "Ouverture de porte, changement de serrure, urgences",
  },
  {
    slug: "chauffagiste",
    nom: "Chauffagiste",
    pluriel: "Chauffagistes",
    icone: "Flame",
    description: "Entretien chaudière, pompe à chaleur, dépannage",
  },
  {
    slug: "jardinier",
    nom: "Jardinier",
    pluriel: "Jardiniers",
    icone: "Trees",
    description: "Entretien de jardin, taille, aménagement paysager",
  },
];

export function findCanton(code: string) {
  return CANTONS.find((c) => c.code === code);
}

export function findMetier(slug: string) {
  return METIERS.find((m) => m.slug === slug);
}
