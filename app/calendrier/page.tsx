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
} from "date-fns";
import { fr } from "date-fns/locale";
import { useProfile } from "@/components/ProfileProvider";
import { Avatar } from "@/components/Avatar";
import { StayForm } from "@/components/StayForm";
import { fetchStays, updateStay } from "@/lib/data";
import type { Stay } from "@/lib/types";
import { MAISONS, maison } from "@/lib/constants";
import { formatRange, nights } from "@/lib/dates";
import { peopleOnDay, membersOf, stayCount } from "@/lib/stays";

export default function CalendrierPage() {
  const { current, profiles } = useProfile();
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

  const monthStays = useMemo(() => {
    const mStart = format(startOfMonth(cursor), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(cursor), "yyyy-MM-dd");
    return stays
      .filter((s) => s.departure >= mStart && s.arrival <= mEnd)
      .sort((a, b) => a.arrival.localeCompare(b.arrival));
  }, [stays, cursor]);

  async function removeMe(stay: Stay) {
    if (!current) return;
    if (!confirm("Te retirer de ce séjour ?")) return;
    try {
      await updateStay(stay.id, {
        member_ids: stay.member_ids.filter((id) => id !== current.id),
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  }

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
      <div className="flex flex-wrap gap-4 mb-5 items-center">
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
            const count = peopleOnDay(list, format(day, "yyyy-MM-dd"));
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[64px] sm:min-h-[88px] rounded-lg p-1.5 ${
                  inMonth ? "bg-sable-50" : "bg-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xs flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday(day)
                        ? "bg-ocean-500 text-white font-semibold"
                        : inMonth
                          ? "text-ocean-700/70"
                          : "text-ocean-700/25"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {count > 0 && (
                    <span
                      className="inline-flex items-center justify-center text-[10px] sm:text-xs bg-ocean-700 text-white rounded-full px-1 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px]"
                      title={`${count} personne(s) présente(s) ce jour`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {list.slice(0, 3).map((s) => {
                    const color = s.maisons?.[0]
                      ? maison(s.maisons[0]).bar
                      : "bg-ocean-400";
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setEditing(s);
                          setFormOpen(true);
                        }}
                        className={`block w-full truncate text-left text-[10px] sm:text-xs text-white px-1 rounded ${color}`}
                        title={s.profile?.name ?? ""}
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
              members={membersOf(s, profiles)}
              isOwner={current?.id === s.profile_id}
              isParticipant={!!current && s.member_ids.includes(current.id)}
              onEdit={() => {
                setEditing(s);
                setFormOpen(true);
              }}
              onRemoveMe={() => removeMe(s)}
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
  members,
  isOwner,
  isParticipant,
  onEdit,
  onRemoveMe,
}: {
  stay: Stay;
  members: { id: string; name: string; avatar_url: string | null }[];
  isOwner: boolean;
  isParticipant: boolean;
  onEdit: () => void;
  onRemoveMe: () => void;
}) {
  const total = stayCount(stay);
  const barColor = stay.maisons?.[0] ? maison(stay.maisons[0]).bar : "bg-ocean-400";
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4 flex items-start gap-4">
      <div className={`w-1.5 self-stretch rounded-full ${barColor}`} />
      {stay.profile && <Avatar profile={stay.profile} size={44} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ocean-700">
            {stay.profile?.name ?? "Quelqu'un"}
          </p>
          {stay.maisons.length > 0 ? (
            stay.maisons.map((mid) => {
              const m = maison(mid);
              return (
                <span
                  key={mid}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}
                >
                  {m.label}
                </span>
              );
            })
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sable-100 text-ocean-600/60">
              Maison non précisée
            </span>
          )}
          {isParticipant && !isOwner && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-marais-500/15 text-marais-600">
              Tu participes
            </span>
          )}
        </div>
        <p className="text-sm text-ocean-700/80 mt-0.5">
          {formatRange(stay.arrival, stay.departure)} ·{" "}
          {nights(stay.arrival, stay.departure)} nuit(s) · {total} pers.
        </p>

        {/* Participants (membres de la famille) */}
        {members.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {members.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 bg-sable-50 rounded-full pl-1 pr-2.5 py-0.5 text-xs text-ocean-700"
              >
                <Avatar profile={m} size={20} />
                {m.name}
              </span>
            ))}
          </div>
        )}
        {/* Invités hors famille */}
        {stay.extra_guests.length > 0 && (
          <p className="text-sm text-ocean-600/70 mt-1.5">
            Avec : {stay.extra_guests.join(", ")}
          </p>
        )}
        {stay.note && (
          <p className="text-sm text-ocean-600/60 italic mt-1.5">“{stay.note}”</p>
        )}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        {isOwner && (
          <button
            onClick={onEdit}
            className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
          >
            Modifier
          </button>
        )}
        {!isOwner && isParticipant && (
          <button
            onClick={onRemoveMe}
            className="text-sm text-red-600/80 hover:text-red-600 font-medium"
          >
            Me retirer
          </button>
        )}
      </div>
    </div>
  );
}
