import { supabase, isSupabaseConfigured } from "./supabase";
import { demoProfiles, demoStays, demoPhotos } from "./demo";
import type { Profile, Stay, Photo } from "./types";

// Couche d'accès aux données.
// - Si Supabase est configuré : on lit/écrit dans la base en ligne (partagé).
// - Sinon : on utilise des données de démonstration en mémoire (aperçu visuel).

// Copies modifiables pour le mode démo
let memProfiles = [...demoProfiles];
let memStays = [...demoStays];
let memPhotos = [...demoPhotos];

function uid() {
  return "mem-" + Math.random().toString(36).slice(2, 10);
}

/* ----------------------------- PROFILS ----------------------------- */

export async function fetchProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured) return [...memProfiles];
  const { data, error } = await supabase!
    .from("profiles")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfileAvatar(
  profileId: string,
  avatarUrl: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    memProfiles = memProfiles.map((p) =>
      p.id === profileId ? { ...p, avatar_url: avatarUrl } : p,
    );
    return;
  }
  const { error } = await supabase!
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profileId);
  if (error) throw error;
}

/* ----------------------------- SÉJOURS ----------------------------- */

export async function fetchStays(): Promise<Stay[]> {
  if (!isSupabaseConfigured) {
    return [...memStays].sort((a, b) => a.arrival.localeCompare(b.arrival));
  }
  const { data, error } = await supabase!
    .from("stays")
    .select("*, profile:profiles(*)")
    .order("arrival", { ascending: true });
  if (error) throw error;
  return data as Stay[];
}

export type StayInput = Omit<Stay, "id" | "created_at" | "profile">;

export async function createStay(input: StayInput): Promise<void> {
  if (!isSupabaseConfigured) {
    memStays = [
      ...memStays,
      {
        ...input,
        id: uid(),
        created_at: new Date().toISOString(),
        profile: memProfiles.find((p) => p.id === input.profile_id) ?? null,
      },
    ];
    return;
  }
  const { error } = await supabase!.from("stays").insert(input);
  if (error) throw error;
}

export async function updateStay(
  id: string,
  input: Partial<StayInput>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    memStays = memStays.map((s) => (s.id === id ? { ...s, ...input } : s));
    return;
  }
  const { error } = await supabase!.from("stays").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteStay(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    memStays = memStays.filter((s) => s.id !== id);
    return;
  }
  const { error } = await supabase!.from("stays").delete().eq("id", id);
  if (error) throw error;
}

/* ----------------------------- PHOTOS ------------------------------ */

export async function fetchPhotos(): Promise<Photo[]> {
  if (!isSupabaseConfigured) {
    return [...memPhotos].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }
  const { data, error } = await supabase!
    .from("photos")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Photo[];
}

export type PhotoInput = {
  profile_id: string;
  category: string;
  image_url: string;
  description: string | null;
};

export async function createPhoto(input: PhotoInput): Promise<void> {
  if (!isSupabaseConfigured) {
    memPhotos = [
      {
        ...input,
        id: uid(),
        created_at: new Date().toISOString(),
        profile: memProfiles.find((p) => p.id === input.profile_id) ?? null,
      },
      ...memPhotos,
    ];
    return;
  }
  const { error } = await supabase!.from("photos").insert(input);
  if (error) throw error;
}

export async function updatePhotoDescription(
  id: string,
  description: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    memPhotos = memPhotos.map((p) =>
      p.id === id ? { ...p, description } : p,
    );
    return;
  }
  const { error } = await supabase!
    .from("photos")
    .update({ description })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePhoto(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    memPhotos = memPhotos.filter((p) => p.id !== id);
    return;
  }
  const { error } = await supabase!.from("photos").delete().eq("id", id);
  if (error) throw error;
}

/* --------------------------- UPLOAD FICHIER ------------------------ */

// Upload d'une image dans Supabase Storage, renvoie l'URL publique.
export async function uploadImage(
  bucket: "photos" | "avatars",
  file: File,
): Promise<string> {
  if (!isSupabaseConfigured) {
    // En mode démo : on renvoie une URL locale temporaire
    return URL.createObjectURL(file);
  }
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase!.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase!.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
