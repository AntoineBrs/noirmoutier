"use client";

import { useRef, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { Avatar } from "@/components/Avatar";
import { uploadImage, updateProfileAvatar } from "@/lib/data";

export default function ProfilPage() {
  const { current, refreshProfiles, signOut } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!current) return null;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !current) return;
    setError("");
    setBusy(true);
    try {
      const url = await uploadImage("avatars", file);
      await updateProfileAvatar(current.id, url);
      await refreshProfiles();
    } catch (err) {
      console.error(err);
      setError("L'envoi de la photo a échoué.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    if (!current) return;
    if (!confirm("Supprimer ta photo de profil ?")) return;
    setBusy(true);
    try {
      await updateProfileAvatar(current.id, null);
      await refreshProfiles();
    } catch (err) {
      console.error(err);
      setError("Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-in-up pt-6 max-w-md">
      <h1 className="font-display text-3xl text-ocean-700 mb-6">Mon profil</h1>

      <div className="bg-white rounded-xl2 shadow-card p-6 flex flex-col items-center text-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <div className="relative mb-4">
          <Avatar profile={current} size={120} />
          {busy && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
              …
            </div>
          )}
        </div>
        <p className="font-display text-2xl text-ocean-700 mb-1">
          {current.name}
        </p>
        <p className="text-sm text-ocean-600/60 mb-6">
          {current.avatar_url
            ? "Ta photo apparaît dans toute la famille."
            : "Ajoute une photo : elle apparaîtra sur l'écran d'accueil."}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="bg-ocean-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ocean-600 transition-colors disabled:opacity-50"
          >
            {current.avatar_url ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {current.avatar_url && (
            <button
              onClick={removePhoto}
              disabled={busy}
              className="border border-red-500/30 text-red-600/90 font-medium px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Supprimer la photo
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>

      <button
        onClick={signOut}
        className="mt-6 text-sm text-ocean-600/80 hover:text-ocean-700 border border-ocean-500/30 hover:border-ocean-500/60 rounded-full px-5 py-2 transition-colors"
      >
        Changer de profil
      </button>
    </div>
  );
}
