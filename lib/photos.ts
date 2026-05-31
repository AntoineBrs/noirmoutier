import type { Photo } from "./types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Tri par date de photo : année décroissante, puis dans l'année les photos
// datées (les plus récentes en haut), puis les photos « année seule » à la fin.
export function comparePhotos(a: Photo, b: Photo): number {
  if (a.photo_year !== b.photo_year) return b.photo_year - a.photo_year;
  const ad = a.photo_date;
  const bd = b.photo_date;
  if (ad && bd) return bd.localeCompare(ad); // date décroissante
  if (ad && !bd) return -1; // datée avant « année seule »
  if (!ad && bd) return 1;
  return b.created_at.localeCompare(a.created_at); // ajout le plus récent d'abord
}

export function photoMonth(p: Photo): number | null {
  if (!p.photo_date) return null;
  return parseISO(p.photo_date).getMonth() + 1; // 1-12
}

export function monthName(month: number): string {
  return capitalize(format(new Date(2000, month - 1, 1), "MMMM", { locale: fr }));
}

export function monthYearLabel(month: number, year: number): string {
  return capitalize(
    format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: fr }),
  );
}

export function photoDateLabel(p: Photo): string {
  if (p.photo_date) {
    return format(parseISO(p.photo_date), "d MMMM yyyy", { locale: fr });
  }
  return String(p.photo_year);
}

export function availableYears(photos: Photo[]): number[] {
  return [...new Set(photos.map((p) => p.photo_year))].sort((a, b) => b - a);
}

export function availableMonths(photos: Photo[], year: number): number[] {
  const months = photos
    .filter((p) => p.photo_year === year && p.photo_date)
    .map((p) => photoMonth(p)!);
  return [...new Set(months)].sort((a, b) => b - a);
}

export type PhotoGroup = {
  key: string;
  label: string;
  photos: Photo[];
};

// Regroupe des photos déjà triées par année (décroissante) puis par mois.
export function groupPhotos(photos: Photo[]): PhotoGroup[] {
  const groups: PhotoGroup[] = [];
  for (const y of availableYears(photos)) {
    const inYear = photos.filter((p) => p.photo_year === y);
    for (const m of availableMonths(inYear, y)) {
      groups.push({
        key: `${y}-${m}`,
        label: monthYearLabel(m, y),
        photos: inYear.filter((p) => photoMonth(p) === m),
      });
    }
    const yearOnly = inYear.filter((p) => !p.photo_date);
    if (yearOnly.length) {
      groups.push({
        key: `${y}-x`,
        label: `${y} · date imprécise`,
        photos: yearOnly,
      });
    }
  }
  return groups;
}
