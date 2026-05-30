import type { Profile, Stay, Photo } from "./types";
import { FAMILY_MEMBERS } from "./constants";

// Données de démonstration utilisées tant que Supabase n'est pas branché.
// Elles permettent de voir le rendu visuel du site immédiatement.

export const demoProfiles: Profile[] = FAMILY_MEMBERS.map((name, i) => ({
  id: `demo-${i}`,
  name,
  avatar_url: null,
  sort_order: i,
  created_at: new Date().toISOString(),
}));

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const today = new Date();

export const demoStays: Stay[] = [
  {
    id: "s1",
    profile_id: "demo-1",
    maison: "sud",
    arrival: iso(addDays(today, 3)),
    departure: iso(addDays(today, 10)),
    guest_count: 3,
    guest_names: ["Antoine", "Claire", "Léo"],
    note: "Vacances de printemps 🌿",
    created_at: new Date().toISOString(),
    profile: demoProfiles[1],
  },
  {
    id: "s2",
    profile_id: "demo-4",
    maison: "nord",
    arrival: iso(addDays(today, 6)),
    departure: iso(addDays(today, 14)),
    guest_count: 2,
    guest_names: ["Simon", "Emma"],
    note: null,
    created_at: new Date().toISOString(),
    profile: demoProfiles[4],
  },
  {
    id: "s3",
    profile_id: "demo-13",
    maison: "annexe",
    arrival: iso(addDays(today, 20)),
    departure: iso(addDays(today, 27)),
    guest_count: 1,
    guest_names: ["Mamie"],
    note: "Un peu de calme au bord de l'eau",
    created_at: new Date().toISOString(),
    profile: demoProfiles[13],
  },
];

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const demoPhotos: Photo[] = [
  {
    id: "p1",
    profile_id: "demo-1",
    category: "noirmoutier",
    image_url: UNSPLASH("photo-1505228395891-9a51e7e86bf6"),
    description: "Coucher de soleil sur la plage des Dames 🌅",
    created_at: new Date().toISOString(),
    profile: demoProfiles[1],
  },
  {
    id: "p2",
    profile_id: "demo-4",
    category: "noirmoutier",
    image_url: UNSPLASH("photo-1507525428034-b723cf961d3e"),
    description: "Le passage du Gois à marée basse",
    created_at: new Date().toISOString(),
    profile: demoProfiles[4],
  },
  {
    id: "p3",
    profile_id: "demo-7",
    category: "famille",
    image_url: UNSPLASH("photo-1529156069898-49953e39b3ac"),
    description: "Tous réunis cet été dans le jardin ❤️",
    created_at: new Date().toISOString(),
    profile: demoProfiles[7],
  },
  {
    id: "p4",
    profile_id: "demo-2",
    category: "quotidien",
    image_url: UNSPLASH("photo-1504674900247-0877df9cc836"),
    description: "Petit déjeuner du dimanche",
    created_at: new Date().toISOString(),
    profile: demoProfiles[2],
  },
  {
    id: "p5",
    profile_id: "demo-10",
    category: "noirmoutier",
    image_url: UNSPLASH("photo-1500964757637-c85e8a162699"),
    description: "Balade sur la côte sauvage",
    created_at: new Date().toISOString(),
    profile: demoProfiles[10],
  },
  {
    id: "p6",
    profile_id: "demo-5",
    category: "quotidien",
    image_url: UNSPLASH("photo-1522202176988-66273c2fd55f"),
    description: "Week-end entre amis 🎉",
    created_at: new Date().toISOString(),
    profile: demoProfiles[5],
  },
];
