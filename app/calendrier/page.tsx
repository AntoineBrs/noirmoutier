"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useProfile } from "@/components/ProfileProvider";
import { Avatar } from "@/components/Avatar";
import { StayForm } from "@/components/StayForm";
import { fetchStays } from "@/lib/data";
import type { Stay } from "@/lib/types";
import { MAISONS, maison } from "@/lib/constants";
import { formatRange, nights } from "@/lib/dates";

export default function CalendrierPage() {
  const { current } = useProfile();
  const [stays, setStays] = useState<Stay[]>([]);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stay | null>(null);

  async function load() {
    try {
      setStays(await fetchStays());
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const arr: Date[] = [];
    let d = start;
    while (d <= end) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [cursor]);

  function staysOnDay(day: Date): Stay[] {
    const s = format(day, "yyyy-MM-dd");
    return stays.filter((st) => st.arrival <= s && st.departure >= s);
  }

  // Séjours qui touchent le mois affiché, pour la liste
  const monthStays = useMemo(() => {
    const mStart = format(startOfMonth(cursor), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(cursor), "yyyy-MM-dd");
    return stays
      .filter((s) => s.departure >= mStart && s.arrival <= mEnd)
      .sort((a, b) => a.arrival.localeCompare(b.arrival));
  }, [stays, cursor]);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="animate-fade-in-up pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl text-ocean-700">
            Calendrier des séjours
          </h1>
          <p className="text-ocean-600/70 text-sm mt-1">
            Qui vient à Noirmoutier, et quand.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-ocean-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ocean-600 transition-colors shadow-card"
        >
          + Ajouter mon séjour
        </button>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-5">
        {MAISONS.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${m.dot}`} />
            <span className="text-ocean-700/80">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="w-9 h-9 rounded-full hover:bg-ocean-500/10 text-ocean-700 flex items-center justify-center"
        >
          ‹
        </button>
        <h2 className="font-display text-xl text-ocean-700 capitalize">
          {format(cursor, "MMMM yyyy", { locale: fr })}
        </h2>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="w-9 h-9 rounded-full hover:bg-ocean-500/10 text-ocean-700 flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Grille du mois */}
      <div className="bg-white rounded-xl2 shadow-card p-2 sm:p-4 mb-8">
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((w) => (
            <div
              key={w}
              className="text-center text-xs font-medium text-ocean-600/50 py-1"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const list = staysOnDay(day);
            const inMonth = isSameMonth(day, cursor);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[64px] sm:min-h-[84px] rounded-lg p-1.5 ${
                  inMonth ? "bg-sable-50" : "bg-transparent"
                }`}
              >
                <div
                  className={`text-xs mb-1 flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday(day)
                      ? "bg-ocean-500 text-white font-semibold"
                      : inMonth
                        ? "text-ocean-700/70"
                        : "text-ocean-700/25"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {list.slice(0, 3).map((s) => {
                    const m = maison(s.maison);
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setEditing(s);
                          setFormOpen(true);
                        }}
                        className={`block w-full truncate text-left text-[10px] sm:text-xs text-white px-1 rounded ${m.bar}`}
                        title={`${s.profile?.name ?? ""} — ${m.label}`}
                      >
                        {s.profile?.name ?? "?"}
                      </button>
                    );
                  })}
                  {list.length > 3 && (
                    <span className="text-[10px] text-ocean-600/50 pl-1">
                      +{list.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste détaillée des séjours du mois */}
      <h2 className="font-display text-2xl text-ocean-700 mb-4">
        Séjours du mois
      </h2>
      {monthStays.length === 0 ? (
        <p className="text-ocean-600/70 bg-white rounded-xl2 p-5 shadow-card">
          Aucun séjour ce mois-ci. Sois le premier à en ajouter un !
        </p>
      ) : (
        <div className="space-y-3">
          {monthStays.map((s) => (
            <StayRow
              key={s.id}
              stay={s}
              isOwner={current?.id === s.profile_id}
              onEdit={() => {
                setEditing(s);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {formOpen && current && (
        <StayForm
          profileId={current.id}
          existing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function StayRow({
  stay,
  isOwner,
  onEdit,
}: {
  stay: Stay;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const m = maison(stay.maison);
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4 flex items-start gap-4">
      <div className={`w-1.5 self-stretch rounded-full ${m.bar}`} />
      {stay.profile && <Avatar profile={stay.profile} size={44} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ocean-700">
            {stay.profile?.name ?? "Quelqu'un"}
          </p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>
            {m.label}
          </span>
        </div>
        <p className="text-sm text-ocean-700/80 mt-0.5">
          {formatRange(stay.arrival, stay.departure)} ·{" "}
          {nights(stay.arrival, stay.departure)} nuit(s)
        </p>
        <p className="text-sm text-ocean-600/70 mt-1">
          {stay.guest_count} personne{stay.guest_count > 1 ? "s" : ""}
          {stay.guest_names && stay.guest_names.length > 0 && (
            <span> · {stay.guest_names.join(", ")}</span>
          )}
        </p>
        {stay.note && (
          <p className="text-sm text-ocean-600/60 italic mt-1">“{stay.note}”</p>
        )}
      </div>
      {isOwner && (
        <button
          onClick={onEdit}
          className="text-sm text-ocean-600 hover:text-ocean-700 font-medium shrink-0"
        >
          Modifier
        </button>
      )}
    </div>
  );
}
