"use client";

import { useState, useRef } from "react";
import { Modal } from "./StayForm";
import { PHOTO_CATEGORIES } from "@/lib/constants";
import { uploadImage, createPhoto } from "@/lib/data";

export function PhotoUploader({
  profileId,
  defaultCategory,
  onClose,
  onSaved,
}: {
  profileId: string;
  defaultCategory: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Choisis une photo à envoyer.");
      return;
    }
    setSaving(true);
    try {
      const url = await uploadImage("photos", file);
      await createPhoto({
        profile_id: profileId,
        category,
        image_url: url,
        description: description.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("L'envoi a échoué. Réessaie.");
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-2xl text-ocean-700 mb-5">
        Ajouter une photo
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={pick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-ocean-500/30 hover:border-ocean-500/60 transition-colors overflow-hidden"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="aperçu"
              className="w-full max-h-72 object-cover"
            />
          ) : (
            <div className="py-12 text-ocean-600/60">
              <div className="text-3xl mb-2">🖼️</div>
              Clique pour choisir une photo
            </div>
          )}
        </button>

        <div>
          <span className="block text-sm font-medium text-ocean-700/80 mb-1.5">
            Catégorie
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PHOTO_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                  category === c.id
                    ? "border-ocean-500 bg-ocean-500/10 text-ocean-700"
                    : "border-ocean-500/20 text-ocean-600/70 hover:border-ocean-500/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-ocean-700/80 mb-1.5">
            Description (facultatif)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Un petit mot sur cette photo…"
            className="w-full rounded-xl border border-ocean-500/20 bg-white px-3 py-2.5 text-ocean-700 resize-none focus:outline-none focus:border-ocean-500"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-ocean-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-ocean-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Envoi…" : "Publier la photo"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-ocean-600/70 hover:text-ocean-700 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}
