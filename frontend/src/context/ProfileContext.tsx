"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createProfile,
  listProfiles,
} from "@/lib/api";
import type { Profile, ProfileCreateInput } from "@/types/profile";
import { useAuth } from "@/context/AuthContext";

const ACTIVE_PROFILE_KEY = "cineportal_active_profile_id";

type ProfileContextValue = {
  profiles: Profile[];
  activeProfile: Profile | null;
  activeProfileId: number | null;
  isLoadingProfiles: boolean;
  reloadProfiles: () => Promise<void>;
  selectProfile: (profileId: number) => void;
  createNewProfile: (input: ProfileCreateInput) => Promise<Profile>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

type ProfileProviderProps = {
  children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { token, isAuthenticated } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const activeProfile = useMemo(() => {
    return profiles.find((profile) => profile.id === activeProfileId) ?? null;
  }, [profiles, activeProfileId]);

  const reloadProfiles = useCallback(async () => {
    if (!token) {
      setProfiles([]);
      setActiveProfileId(null);
      return;
    }

    setIsLoadingProfiles(true);

    try {
      const data = await listProfiles(token);
      setProfiles(data);

      const storedProfileId =
        typeof window !== "undefined"
          ? localStorage.getItem(ACTIVE_PROFILE_KEY)
          : null;

      const parsedStoredProfileId = storedProfileId
        ? Number(storedProfileId)
        : null;

      const storedProfileStillExists = data.some(
        (profile) => profile.id === parsedStoredProfileId
      );

      if (storedProfileStillExists && parsedStoredProfileId) {
        setActiveProfileId(parsedStoredProfileId);
      } else if (data.length > 0) {
        setActiveProfileId(data[0].id);
        localStorage.setItem(ACTIVE_PROFILE_KEY, String(data[0].id));
      } else {
        setActiveProfileId(null);
        localStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      reloadProfiles();
    } else {
      setProfiles([]);
      setActiveProfileId(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    }
  }, [isAuthenticated, reloadProfiles]);

  function selectProfile(profileId: number) {
    setActiveProfileId(profileId);

    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileId));
    }
  }

  async function createNewProfile(input: ProfileCreateInput) {
    if (!token) {
      throw new Error("You must be logged in to create a profile.");
    }

    const profile = await createProfile(token, input);
    await reloadProfiles();
    selectProfile(profile.id);

    return profile;
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        isLoadingProfiles,
        reloadProfiles,
        selectProfile,
        createNewProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfiles must be used inside ProfileProvider.");
  }

  return context;
}