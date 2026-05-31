"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Lightbox } from "@/components/Lightbox";
import { Avatar } from "@/components/Avatar";
import { fetchPhotos } from "@/lib/data";
import type { Photo } from "@/lib/types";
import { PHOTO_CATEGORIES } from "@/lib/constants";
import {
  groupPhotos,
  availableYears,
  availableMonths,
  photoMonth,
  monthName,
} from "@/lib/photos";

export default function CarnetPage() {
  const { current } = useProfile();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [year, setYear] = useState<number | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [active, setActive] = useState<Photo | null>(null);

  async function load() {
    try {
      setPhotos(await fetchPhotos());
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    load();
  }, []);

  // Photos filtrées par catégorie (sert de base pour les années dispo)
  const byCategory = useMemo(
    () => (tab === "all" ? photos : photos.filter((p) => p.category === tab)),
    [photos, tab],
  );

  const years = useMemo(() => availableYears(byCategory), [byCategory]);
  const months = useMemo(
    () => (year === "all" ? [] : availableMonths(byCategory, year)),
    [byCategory, year],
  );

  // Application des filtres année / mois
  const filtered = useMemo(() => {
    let list = byCategory;
    if (year !== "all") list = list.filter((p) => p.photo_year === year);
    if (year !== "all" && month !== "all")
      list = list.filter((p) => photoMonth(p) === month);
    return list;
  }, [byCategory, year, month]);

  const groups = useMemo(() => groupPhotos(filtered), [filtered]);

  return (
    <div className="animate-fade-in-up pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="font-display text-3xl text-ocean-700">
            Le carnet de famille
          </h1>
          <p className="text-ocean-600/70 text-sm mt-1">
            Nos photos de Noirmoutier, de famille et du quotidien.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="bg-ocean-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ocean-600 transition-colors shadow-card"
        >
          + Ajouter une photo
        </button>
      </div>

      {/* Onglets catégories */}
      <div className="flex flex-wrap gap-2 mt-6 mb-4">
        <Tab id="all" label="Tout" active={tab} onClick={setTab} />
        {PHOTO_CATEGORIES.map((c) => (
          <Tab
            key={c.id}
            id={c.id}
            label={c.label}
            active={tab}
            onClick={setTab}
          />
        ))}
      </div>

      {/* Filtres année / mois */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="text-sm text-ocean-600/70">Filtrer&nbsp;:</span>
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value === "all" ? "all" : Number(e.target.value));
            setMonth("all");
          }}
          className="rounded-full border border-ocean-500/20 bg-white px-4 py-2 text-sm text-ocean-700 focus:outline-none focus:border-ocean-500"
        >
          <option value="all">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {year !== "all" && months.length > 0 && (
          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="rounded-full border border-ocean-500/20 bg-white px-4 py-2 text-sm text-ocean-700 focus:outline-none focus:border-ocean-500"
          >
            <option value="all">Tous les mois</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthName(m)}
              </option>
            ))}
          </select>
        )}
        {(year !== "all" || month !== "all") && (
          <button
            onClick={() => {
              setYear("all");
              setMonth("all");
            }}
            className="text-sm text-ocean-600 hover:text-ocean-700"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl2 shadow-card p-10 text-center">
          <div className="text-4xl mb-3">📷</div>
          <p className="text-ocean-700 font-medium mb-1">
            Aucune photo pour cette sélection
          </p>
          <p className="text-ocean-600/70 text-sm">
            Change de filtre ou ajoute un nouveau souvenir !
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="font-display text-xl text-ocean-700 mb-4 flex items-center gap-3">
                {g.label}
                <span className="h-px flex-1 bg-ocean-500/10" />
                <span className="text-sm font-sans text-ocean-600/50">
                  {g.photos.length} photo{g.photos.length > 1 ? "s" : ""}
                </span>
              </h2>
              <div className="masonry">
                {g.photos.map((p) => (
                  <PhotoCard key={p.id} photo={p} onOpen={() => setActive(p)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {uploadOpen && current && (
        <PhotoUploader
          profileId={current.id}
          defaultCategory={tab === "all" ? "quotidien" : tab}
          onClose={() => setUploadOpen(false)}
          onSaved={load}
        />
      )}

      {active && (
        <Lightbox
          photo={active}
          isOwner={current?.id === active.profile_id}
          onClose={() => setActive(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

function PhotoCard({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group block w-full rounded-2xl overflow-hidden shadow-card bg-white hover:shadow-soft transition-shadow text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.image_url}
        alt={photo.description ?? "Photo"}
        className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        loading="lazy"
      />
      <div className="p-3">
        {photo.description && (
          <p className="text-sm text-ocean-700/90 line-clamp-2 mb-2">
            {photo.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          {photo.profile && <Avatar profile={photo.profile} size={24} />}
          <span className="text-xs text-ocean-600/60">{photo.profile?.name}</span>
        </div>
      </div>
    </button>
  );
}

function Tab({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: string;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active === id
          ? "bg-ocean-500 text-white"
          : "bg-white text-ocean-600/80 hover:text-ocean-700 shadow-card"
      }`}
    >
      {label}
    </button>
  );
}
