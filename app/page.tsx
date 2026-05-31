"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { Avatar } from "@/components/Avatar";
import { fetchStays, updateStay } from "@/lib/data";
import type { Stay } from "@/lib/types";
import { maison } from "@/lib/constants";
import { formatRange, isOngoing, daysUntil } from "@/lib/dates";
import { stayCount } from "@/lib/stays";

export default function Home() {
  const { current } = useProfile();
  const [stays, setStays] = useState<Stay[]>([]);

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const present = stays.filter((s) => isOngoing(s, todayStr));
  const upcoming = stays.filter((s) => s.arrival > todayStr).slice(0, 4);

  // Séjours où l'on m'a ajouté (je participe mais je ne suis pas l'organisateur)
  const invitedTo = current
    ? stays.filter(
        (s) =>
          s.profile_id !== current.id &&
          s.member_ids?.includes(current.id) &&
          s.departure >= todayStr,
      )
    : [];

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

  return (
    <div className="animate-fade-in-up">
      {/* HERO */}
      <section className="relative rounded-3xl overflow-hidden mt-6 mb-10 shadow-soft">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=70')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-700/80 via-ocean-700/30 to-transparent" />
        <div className="relative px-6 sm:px-10 py-16 sm:py-24 text-white">
          <p className="tracking-[0.3em] uppercase text-xs sm:text-sm text-white/80 mb-3">
            Notre maison de famille
          </p>
          <h1 className="font-display text-4xl sm:text-6xl mb-4 max-w-2xl leading-tight">
            Bonjour {current?.name}, bienvenue à Noirmoutier
          </h1>
          <p className="text-white/90 max-w-xl text-lg mb-8">
            Le calendrier des séjours et le carnet de photos de la famille,
            réunis au même endroit.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/calendrier"
              className="bg-white text-ocean-700 font-semibold px-6 py-3 rounded-full hover:bg-sable-50 transition-colors"
            >
              Voir le calendrier
            </Link>
            <Link
              href="/carnet"
              className="bg-white/15 backdrop-blur text-white font-semibold px-6 py-3 rounded-full hover:bg-white/25 transition-colors border border-white/30"
            >
              Ouvrir le carnet
            </Link>
          </div>
        </div>
      </section>

      {/* TU AS ÉTÉ AJOUTÉ */}
      {invitedTo.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-2xl text-ocean-700 mb-1">
            Tu participes à ces séjours
          </h2>
          <p className="text-ocean-600/70 text-sm mb-4">
            Quelqu'un t'a ajouté. Tu peux te retirer si tu ne viens pas.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {invitedTo.map((s) => (
              <StayCard key={s.id} stay={s} onRemoveMe={() => removeMe(s)} />
            ))}
          </div>
        </section>
      )}

      {/* QUI EST LÀ */}
      <section className="mb-10">
        <h2 className="font-display text-2xl text-ocean-700 mb-4">
          {present.length > 0
            ? "En ce moment à la maison"
            : "Personne à la maison aujourd'hui"}
        </h2>
        {present.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {present.map((s) => (
              <StayCard key={s.id} stay={s} highlight />
            ))}
          </div>
        ) : (
          <p className="text-ocean-600/70 bg-white rounded-xl2 p-5 shadow-card">
            La maison est calme… c'est peut-être le moment d'organiser un séjour
            !
          </p>
        )}
      </section>

      {/* PROCHAINS SÉJOURS */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-ocean-700">
            Prochains séjours
          </h2>
          <Link
            href="/calendrier"
            className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
          >
            Tout voir →
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </div>
        ) : (
          <p className="text-ocean-600/70 bg-white rounded-xl2 p-5 shadow-card">
            Aucun séjour prévu pour l'instant.
          </p>
        )}
      </section>

      {/* RACCOURCIS */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/calendrier"
          className="group bg-white rounded-xl2 p-6 shadow-card hover:shadow-soft transition-shadow"
        >
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-display text-xl text-ocean-700 mb-1">
            Le calendrier des séjours
          </h3>
          <p className="text-ocean-600/70 text-sm">
            Indique quand tu viens, avec qui et dans quelle maison.
          </p>
        </Link>
        <Link
          href="/carnet"
          className="group bg-white rounded-xl2 p-6 shadow-card hover:shadow-soft transition-shadow"
        >
          <div className="text-3xl mb-3">📸</div>
          <h3 className="font-display text-xl text-ocean-700 mb-1">
            Le carnet de famille
          </h3>
          <p className="text-ocean-600/70 text-sm">
            Partage tes photos de Noirmoutier, de famille et du quotidien.
          </p>
        </Link>
      </section>
    </div>
  );
}

function StayCard({
  stay,
  highlight,
  onRemoveMe,
}: {
  stay: Stay;
  highlight?: boolean;
  onRemoveMe?: () => void;
}) {
  const until = daysUntil(stay.arrival);
  const total = stayCount(stay);
  return (
    <div
      className={`bg-white rounded-xl2 p-4 shadow-card ${
        highlight ? "ring-1 ring-ocean-400/30" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        {stay.profile && <Avatar profile={stay.profile} size={36} />}
        <div className="min-w-0">
          <p className="font-medium text-ocean-700 truncate">
            {stay.profile?.name ?? "Quelqu'un"}
          </p>
          <p className="text-xs text-ocean-600/60">
            {total} pers.
          </p>
        </div>
      </div>
      <p className="text-sm text-ocean-700/90">
        {formatRange(stay.arrival, stay.departure)}
      </p>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {stay.maisons.length > 0 ? (
          stay.maisons.map((mid) => {
            const m = maison(mid);
            return (
              <span key={mid} className="flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${m.dot}`} />
                <span className={`text-xs font-medium ${m.color}`}>
                  {m.label}
                </span>
              </span>
            );
          })
        ) : (
          <span className="text-xs text-ocean-600/40">Maison non précisée</span>
        )}
        {!highlight && !onRemoveMe && until > 0 && (
          <span className="text-xs text-ocean-600/50 ml-auto">
            dans {until} j
          </span>
        )}
      </div>
      {onRemoveMe && (
        <button
          onClick={onRemoveMe}
          className="mt-3 text-xs text-red-600/80 hover:text-red-600 font-medium"
        >
          Me retirer
        </button>
      )}
    </div>
  );
}
