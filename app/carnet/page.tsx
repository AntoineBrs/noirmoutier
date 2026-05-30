"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Lightbox } from "@/components/Lightbox";
import { Avatar } from "@/components/Avatar";
import { fetchPhotos } from "@/lib/data";
import type { Photo } from "@/lib/types";
import { PHOTO_CATEGORIES } from "@/lib/constants";

export default function CarnetPage() {
  const { current } = useProfile();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<string>("all");
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

  const visible =
    tab === "all" ? photos : photos.filter((p) => p.category === tab);

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
      <div className="flex flex-wrap gap-2 my-6">
        <Tab id="all" label="Tout" active={tab} onClick={setTab} />
        {PHOTO_CATEGORIES.map((c) => (
          <Tab key={c.id} id={c.id} label={c.label} active={tab} onClick={setTab} />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-xl2 shadow-card p-10 text-center">
          <div className="text-4xl mb-3">📷</div>
          <p className="text-ocean-700 font-medium mb-1">
            Aucune photo pour l'instant
          </p>
          <p className="text-ocean-600/70 text-sm">
            Sois le premier à partager un souvenir !
          </p>
        </div>
      ) : (
        <div className="masonry">
          {visible.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="group block w-full rounded-2xl overflow-hidden shadow-card bg-white hover:shadow-soft transition-shadow text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={p.description ?? "Photo"}
                className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
              <div className="p-3">
                {p.description && (
                  <p className="text-sm text-ocean-700/90 line-clamp-2 mb-2">
                    {p.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {p.profile && <Avatar profile={p.profile} size={24} />}
                  <span className="text-xs text-ocean-600/60">
                    {p.profile?.name}
                  </span>
                </div>
              </div>
            </button>
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
