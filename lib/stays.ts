import type { Stay, Profile } from "./types";

// Nombre de personnes d'un séjour (membres de la famille + invités manuels)
export function stayCount(stay: Stay): number {
  return (stay.member_ids?.length || 0) + (stay.extra_guests?.length || 0);
}

// Nombre total de personnes présentes un jour donné, toutes maisons confondues.
// Les membres de la famille sont comptés une seule fois même s'ils
// apparaissent dans plusieurs séjours le même jour.
export function peopleOnDay(stays: Stay[], dayStr: string): number {
  const memberSet = new Set<string>();
  let extras = 0;
  for (const s of stays) {
    if (s.arrival <= dayStr && s.departure >= dayStr) {
      (s.member_ids || []).forEach((id) => memberSet.add(id));
      extras += (s.extra_guests || []).length;
    }
  }
  return memberSet.size + extras;
}

// Résout les profils participants d'un séjour à partir de la liste complète.
export function membersOf(stay: Stay, profiles: Profile[]): Profile[] {
  return (stay.member_ids || [])
    .map((id) => profiles.find((p) => p.id === id))
    .filter((p): p is Profile => Boolean(p));
}
