"use client";

import { useState } from "react";
import { MAISONS } from "@/lib/constants";
import { createStay, updateStay, deleteStay } from "@/lib/data";
import { useProfile } from "./ProfileProvider";
import { Avatar } from "./Avatar";
import type { Stay } from "@/lib/types";

type Props = {
  profileId: string;
  existing?: Stay | null;
  onClose: () => void;
  onSaved: () => void;
};

export function StayForm({ profileId, existing, onClose, onSaved }: Props) {
  const { profiles } = useProfile();
  const [arrival, setArrival] = useState(existing?.arrival ?? "");
  const [departure, setDeparture] = useState(existing?.departure ?? "");
  const [maisons, setMaisons] = useState<string[]>(existing?.maisons ?? []);
  const [memberIds, setMemberIds] = useState<string[]>(
    existing?.member_ids && existing.member_ids.length > 0
      ? existing.member_ids
      : [profileId],
  );
  const [extras, setExtras] = useState<string[]>(
    existing?.extra_guests && existing.extra_guests.length > 0
      ? existing.extra_guests
      : [],
  );
  const [note, setNote] = useState(existing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedMembers = memberIds
    .map((id) => profiles.find((p) => p.id === id))
    .filter(Boolean);
  const available = profiles.filter((p) => !memberIds.includes(p.id));
  const cleanExtras = extras.map((n) => n.trim()).filter(Boolean);
  const total = memberIds.length + cleanExtras.length;

  function toggleMaison(id: string) {
    setMaisons((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!arrival || !departure) {
      setError("Indique les dates d'arrivée et de départ.");
      return;
    }
    if (departure < arrival) {
      setError("La date de départ doit être après l'arrivée.");
      return;
    }
    if (total === 0) {
      setError("Ajoute au moins une personne au séjour.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        profile_id: profileId,
        maisons,
        arrival,
        departure,
        member_ids: memberIds,
        extra_guests: cleanExtras,
        note: note.trim() || null,
      };
      if (existing) {
        await updateStay(existing.id, payload);
      } else {
        await createStay(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("Supprimer ce séjour ?")) return;
    setSaving(true);
    try {
      await deleteStay(existing.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Suppression impossible.");
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-2xl text-ocean-700 mb-5">
        {existing ? "Modifier le séjour" : "Ajouter un séjour"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Arrivée">
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Départ">
            <input
              type="date"
              value={departure}
              min={arrival || undefined}
              onChange={(e) => setDeparture(e.target.value)}
              className="input"
              required
            />
          </Field>
        </div>

        {/* MEMBRES DE LA FAMILLE */}
        <Field label="Qui vient ? (membres de la famille)">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedMembers.map(
              (p) =>
                p && (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 bg-ocean-500/10 text-ocean-700 rounded-full pl-1 pr-2 py-1 text-sm"
                  >
                    <Avatar profile={p} size={22} />
                    {p.name}
                    <button
                      type="button"
                      onClick={() =>
                        setMemberIds(memberIds.filter((id) => id !== p.id))
                      }
                      className="text-ocean-600/50 hover:text-ocean-700"
                      aria-label={`Retirer ${p.name}`}
                    >
                      ✕
                    </button>
                  </span>
                ),
            )}
            {selectedMembers.length === 0 && (
              <span className="text-sm text-ocean-600/50 italic py-1">
                Personne pour l'instant
              </span>
            )}
          </div>
          {available.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setMemberIds([...memberIds, e.target.value]);
              }}
              className="input"
            >
              <option value="">+ Ajouter un membre…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* INVITÉS MANUELS */}
        <Field label="Autres personnes (hors famille, facultatif)">
          <div className="space-y-2">
            {extras.map((n, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={n}
                  onChange={(e) => {
                    const copy = [...extras];
                    copy[i] = e.target.value;
                    setExtras(copy);
                  }}
                  placeholder="Prénom"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setExtras(extras.filter((_, j) => j !== i))}
                  className="text-ocean-600/50 hover:text-ocean-700 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setExtras([...extras, ""])}
              className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
            >
              + Ajouter une personne
            </button>
          </div>
        </Field>

        {/* MAISONS (multiple, facultatif) */}
        <Field label="Maison(s) (facultatif, plusieurs possibles)">
          <div className="grid grid-cols-3 gap-2">
            {MAISONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMaison(m.id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  maisons.includes(m.id)
                    ? "border-ocean-500 bg-ocean-500/10 text-ocean-700"
                    : "border-ocean-500/20 text-ocean-600/70 hover:border-ocean-500/40"
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${m.dot} mr-1.5 align-middle`}
                />
                {m.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Une note (facultatif)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ex : vacances de Pâques, on amène le chien…"
            className="input resize-none"
          />
        </Field>

        <p className="text-sm text-ocean-600/70">
          Total : <strong>{total}</strong> personne{total > 1 ? "s" : ""}
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-ocean-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-ocean-600 transition-colors disabled:opacity-50"
          >
            {saving ? "…" : existing ? "Enregistrer" : "Ajouter le séjour"}
          </button>
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-red-600/80 hover:text-red-600 text-sm font-medium"
            >
              Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-ocean-600/70 hover:text-ocean-700 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(61, 130, 148, 0.2);
          background: #fff;
          padding: 0.6rem 0.8rem;
          color: #274f5d;
          font-size: 0.95rem;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #3d8294;
          box-shadow: 0 0 0 3px rgba(61, 130, 148, 0.12);
        }
      `}</style>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ocean-700/80 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-ocean-700/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-sel w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-soft p-6 sm:p-8 max-h-[92vh] overflow-y-auto animate-fade-in-up my-0 sm:my-8">
        {children}
      </div>
    </div>
  );
}
