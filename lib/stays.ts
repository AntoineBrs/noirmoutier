import type { Stay, Profile } from "./types";

// Nombre de personnes d'un séjour (membres de la famille + invités manuels)
export function stayCount(stay: Stay): number {
  return (stay.member_ids?.length || 0) + (stay.extra_guests?.length || 0);
}

// Nombre total de personnes présentes un jour donné, toutes maisons confondues.
// C'est la SOMME des personnes de tous les séjours présents ce jour-là
// (ex : un séjour de 3 + un séjour de 2 le même jour = 5).
export function peopleOnDay(stays: Stay[], dayStr: string): number {
  let total = 0;
  for (const s of stays) {
    if (s.arrival <= dayStr && s.departure >= dayStr) {
      total += stayCount(s);
    }
  }
  return total;
}

// Résout les profils participants d'un séjour à partir de la liste complète.
export function membersOf(stay: Stay, profiles: Profile[]): Profile[] {
  return (stay.member_ids || [])
    .map((id) => profiles.find((p) => p.id === id))
    .filter((p): p is Profile => Boolean(p));
}
