"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import type { Photo } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { photoDateLabel } from "@/lib/photos";
import {
  updatePhotoDescription,
  updatePhotoDate,
  deletePhoto,
} from "@/lib/data";

export function Lightbox({
  photo,
  isOwner,
  onClose,
  onChanged,
}: {
  photo: Photo;
  isOwner: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const years = Array.from(
    { length: currentYear - 1949 },
    (_, i) => currentYear - i,
  );

  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(photo.description ?? "");
  const [busy, setBusy] = useState(false);

  // Date affichée (mise à jour immédiatement après enregistrement)
  const [pd, setPd] = useState<string | null>(photo.photo_date);
  const [py, setPy] = useState<number>(photo.photo_year);
  const [editingDate, setEditingDate] = useState(false);
  const [dateMode, setDateMode] = useState<"full" | "year">(
    photo.photo_date ? "full" : "year",
  );
  const [fullDate, setFullDate] = useState(
    photo.photo_date ?? today.toISOString().slice(0, 10),
  );
  const [yr, setYr] = useState(photo.photo_year);

  async function download() {
    try {
      const res = await fetch(photo.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `noirmoutier-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(photo.image_url, "_blank");
    }
  }

  async function saveDesc() {
    setBusy(true);
    try {
      await updatePhotoDescription(photo.id, desc.trim());
      setEditing(false);
      onChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function saveDate() {
    setBusy(true);
    try {
      const ndate = dateMode === "full" ? fullDate : null;
      const nyear = dateMode === "full" ? Number(fullDate.slice(0, 4)) : yr;
      await updatePhotoDate(photo.id, ndate, nyear);
      setPd(ndate);
      setPy(nyear);
      setEditingDate(false);
      onChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Supprimer cette photo ?")) return;
    setBusy(true);
    try {
      await deletePhoto(photo.id);
      onChanged();
      onClose();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  const dateLabel = photoDateLabel({ ...photo, photo_date: pd, photo_year: py });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-ocean-700/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-sel w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-soft flex flex-col sm:flex-row max-h-screen sm:max-h-[88vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Image */}
        <div className="bg-ocean-700/5 flex items-center justify-center flex-1 min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.image_url}
            alt={photo.description ?? "Photo"}
            className="max-h-[50vh] sm:max-h-[88vh] w-full object-contain"
          />
        </div>

        {/* Panneau infos */}
        <div className="w-full sm:w-72 shrink-0 p-5 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-3">
            {photo.profile && <Avatar profile={photo.profile} size={40} />}
            <div>
              <p className="font-medium text-ocean-700">
                {photo.profile?.name ?? "Quelqu'un"}
              </p>
              {!editingDate && (
                <p className="text-xs text-ocean-600/60">📷 {dateLabel}</p>
              )}
            </div>
          </div>

          {/* Édition de la date */}
          {editingDate ? (
            <div className="mb-4 rounded-xl bg-white border border-ocean-500/15 p-3 space-y-2">
              <p className="text-xs font-medium text-ocean-700/80">
                Date de la photo
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setDateMode("full")}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
                    dateMode === "full"
                      ? "border-ocean-500 bg-ocean-500/10 text-ocean-700"
                      : "border-ocean-500/20 text-ocean-600/70"
                  }`}
                >
                  Date complète
                </button>
                <button
                  onClick={() => setDateMode("year")}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
                    dateMode === "year"
                      ? "border-ocean-500 bg-ocean-500/10 text-ocean-700"
                      : "border-ocean-500/20 text-ocean-600/70"
                  }`}
                >
                  Année
                </button>
              </div>
              {dateMode === "full" ? (
                <input
                  type="date"
                  value={fullDate}
                  max={today.toISOString().slice(0, 10)}
                  onChange={(e) => setFullDate(e.target.value)}
                  className="w-full rounded-lg border border-ocean-500/20 bg-white px-2 py-1.5 text-sm text-ocean-700 focus:outline-none focus:border-ocean-500"
                />
              ) : (
                <select
                  value={yr}
                  onChange={(e) => setYr(Number(e.target.value))}
                  className="w-full rounded-lg border border-ocean-500/20 bg-white px-2 py-1.5 text-sm text-ocean-700 focus:outline-none focus:border-ocean-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveDate}
                  disabled={busy}
                  className="bg-ocean-500 text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-ocean-600 disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditingDate(false)}
                  className="text-sm text-ocean-600/70"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            isOwner && (
              <button
                onClick={() => setEditingDate(true)}
                className="self-start text-xs text-ocean-600 hover:text-ocean-700 mb-3"
              >
                ✎ Modifier la date
              </button>
            )
          )}

          {/* Description */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-ocean-500/20 bg-white px-3 py-2 text-sm text-ocean-700 resize-none focus:outline-none focus:border-ocean-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveDesc}
                  disabled={busy}
                  className="bg-ocean-500 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-ocean-600 disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDesc(photo.description ?? "");
                  }}
                  className="text-sm text-ocean-600/70"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-ocean-700/90 text-sm flex-1">
              {photo.description || (
                <span className="text-ocean-600/40 italic">
                  Pas de description.
                </span>
              )}
            </p>
          )}

          <div className="mt-auto pt-5 space-y-2">
            <p className="text-xs text-ocean-600/40">
              Ajoutée le {formatDate(photo.created_at)}
            </p>
            <button
              onClick={download}
              className="w-full bg-ocean-500 text-white font-medium py-2.5 rounded-full hover:bg-ocean-600 transition-colors"
            >
              ⬇ Télécharger
            </button>
            {isOwner && !editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 border border-ocean-500/30 text-ocean-700 text-sm py-2 rounded-full hover:bg-ocean-500/8"
                >
                  Modifier le texte
                </button>
                <button
                  onClick={remove}
                  disabled={busy}
                  className="flex-1 border border-red-500/30 text-red-600/90 text-sm py-2 rounded-full hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
