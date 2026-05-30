"use client";

import { useRef, useState } from "react";
import { useProfile } from "./ProfileProvider";
import { Avatar } from "./Avatar";
import type { Profile } from "@/lib/types";
import { uploadImage, updateProfileAvatar } from "@/lib/data";

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { current, loading, profiles, selectProfile, refreshProfiles } =
    useProfile();
  const [editing, setEditing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingProfile = useRef<Profile | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-gradient">
        <div className="animate-pulse text-ocean-600 font-display text-2xl">
          Noirmoutier…
        </div>
      </div>
    );
  }

  if (current) return <>{children}</>;

  function askPhoto(p: Profile) {
    pendingProfile.current = p;
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const p = pendingProfile.current;
    e.target.value = "";
    if (!file || !p) return;
    try {
      setUploadingId(p.id);
      const url = await uploadImage("avatars", file);
      await updateProfileAvatar(p.id, url);
      await refreshProfiles();
    } catch (err) {
      console.error(err);
      alert("L'envoi de la photo a échoué.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 py-16">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      <p className="text-ocean-500 tracking-[0.3em] uppercase text-xs mb-3">
        La maison de famille
      </p>
      <h1 className="font-display text-4xl sm:text-5xl text-ocean-700 mb-2 text-center">
        Qui es-tu&nbsp;?
      </h1>
      <p className="text-ocean-600/70 mb-10 text-center max-w-md">
        Choisis ton profil pour entrer dans le carnet de famille de Noirmoutier.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5 sm:gap-7 max-w-3xl">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => (editing ? askPhoto(p) : selectProfile(p))}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <div className="relative">
              <div className="transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 ring-ocean-400/40 rounded-full">
                <Avatar profile={p} size={84} />
              </div>
              {uploadingId === p.id && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-xs">
                  …
                </div>
              )}
              {editing && uploadingId !== p.id && (
                <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center text-white">
                  <CameraIcon />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-ocean-700/90 group-hover:text-ocean-700">
              {p.name}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setEditing((v) => !v)}
        className="mt-12 text-sm text-ocean-600/80 hover:text-ocean-700 border border-ocean-500/30 hover:border-ocean-500/60 rounded-full px-5 py-2 transition-colors"
      >
        {editing
          ? "✓ Terminé"
          : "Ajouter / modifier une photo de profil"}
      </button>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8a2 2 0 0 1 2-2h1l1-1.5h8L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
