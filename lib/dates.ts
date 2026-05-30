import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";
import type { Stay } from "./types";

export function formatDate(iso: string) {
  return format(parseISO(iso), "d MMM yyyy", { locale: fr });
}

export function formatRange(arrival: string, departure: string) {
  const a = parseISO(arrival);
  const d = parseISO(departure);
  const sameMonth =
    a.getMonth() === d.getMonth() && a.getFullYear() === d.getFullYear();
  if (sameMonth) {
    return `du ${format(a, "d", { locale: fr })} au ${format(d, "d MMMM yyyy", {
      locale: fr,
    })}`;
  }
  return `du ${format(a, "d MMM", { locale: fr })} au ${format(
    d,
    "d MMM yyyy",
    { locale: fr },
  )}`;
}

export function isOngoing(stay: Stay, todayStr: string) {
  return stay.arrival <= todayStr && stay.departure >= todayStr;
}

export function daysUntil(iso: string) {
  return differenceInCalendarDays(parseISO(iso), new Date());
}

export function nights(arrival: string, departure: string) {
  return Math.max(1, differenceInCalendarDays(parseISO(departure), parseISO(arrival)));
}
