export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Stay = {
  id: string;
  profile_id: string;
  maison: string;
  arrival: string; // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  guest_count: number;
  guest_names: string[] | null;
  note: string | null;
  created_at: string;
  // jointure éventuelle
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
