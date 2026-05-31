export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Stay = {
  id: string;
  profile_id: string; // créateur / propriétaire du séjour
  maisons: string[]; // 0..n maisons (facultatif)
  arrival: string; // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  member_ids: string[]; // profils de la famille participant au séjour
  extra_guests: string[]; // personnes ajoutées manuellement (hors liste)
  note: string | null;
  created_at: string;
  // jointure éventuelle (propriétaire)
  profile?: Profile | null;
};

export type Photo = {
  id: string;
  profile_id: string;
  category: string;
  image_url: string;
  description: string | null;
  created_at: string;
  profile?: Profile | null;
};
