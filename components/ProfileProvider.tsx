"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Profile } from "@/lib/types";
import { fetchProfiles } from "@/lib/data";

type Ctx = {
  profiles: Profile[];
  current: Profile | null;
  loading: boolean;
  selectProfile: (p: Profile) => void;
  signOut: () => void;
  refreshProfiles: () => Promise<void>;
};

const ProfileContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "noirmoutier:profileId";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    const list = await fetchProfiles();
    setProfiles(list);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshProfiles();
      } catch (e) {
        console.error("Chargement des profils impossible", e);
      }
      const saved =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      setCurrentId(saved);
      setLoading(false);
    })();
  }, [refreshProfiles]);

  const selectProfile = useCallback((p: Profile) => {
    window.localStorage.setItem(STORAGE_KEY, p.id);
    setCurrentId(p.id);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setCurrentId(null);
  }, []);

  const current = profiles.find((p) => p.id === currentId) ?? null;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        current,
        loading,
        selectProfile,
        signOut,
        refreshProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile doit être utilisé dans ProfileProvider");
  return ctx;
}
