// Les membres de la famille pré-enregistrés (écran de choix façon Netflix)
export const FAMILY_MEMBERS = [
  "Adrien",
  "Antoine",
  "Eloi",
  "Alice",
  "Simon",
  "Chloé",
  "Samuel",
  "Florence",
  "Jeanne",
  "Michel",
  "Guillaume",
  "Mélanie",
  "Thomas",
  "Mamie",
] as const;

export type MaisonId = "sud" | "nord" | "annexe";

export const MAISONS: {
  id: MaisonId;
  label: string;
  color: string; // texte/badge
  bg: string; // fond doux
  bar: string; // barre du calendrier
  dot: string;
}[] = [
  {
    id: "sud",
    label: "Maison Sud",
    color: "text-ocean-700",
    bg: "bg-ocean-500/10",
    bar: "bg-ocean-500",
    dot: "bg-ocean-500",
  },
  {
    id: "nord",
    label: "Maison Nord",
    color: "text-marais-600",
    bg: "bg-marais-500/10",
    bar: "bg-marais-500",
    dot: "bg-marais-500",
  },
  {
    id: "annexe",
    label: "Annexe",
    color: "text-sable-300",
    bg: "bg-sable-200/40",
    bar: "bg-sable-300",
    dot: "bg-sable-300",
  },
];

export function maison(id: string) {
  return MAISONS.find((m) => m.id === id) ?? MAISONS[0];
}

export const PHOTO_CATEGORIES: { id: string; label: string; hint: string }[] = [
  {
    id: "noirmoutier",
    label: "Noirmoutier",
    hint: "Les paysages, la plage, le sel, l'île",
  },
  {
    id: "famille",
    label: "Famille",
    hint: "Nos moments tous ensemble",
  },
  {
    id: "quotidien",
    label: "Quotidien",
    hint: "Vos nouvelles, voyages et instants du jour",
  },
];
