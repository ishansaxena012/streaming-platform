import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Profile } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (user: User, accessToken: string, refreshToken: string, profiles: Profile[]) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setActiveProfile: (profile: Profile | null) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      profiles: [],
      activeProfile: null,
      isAuthenticated: false,
      isLoading: false,
      
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      login: (user, accessToken, refreshToken, profiles) =>
        set({
          user,
          accessToken,
          refreshToken,
          profiles,
          isAuthenticated: true,
          activeProfile: profiles.length > 0 ? profiles[0] : null,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          profiles: [],
          activeProfile: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setActiveProfile: (profile) => set({ activeProfile: profile }),

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
        })),

      updateProfile: (updatedProfile) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === updatedProfile.id ? updatedProfile : p
          ),
          activeProfile:
            state.activeProfile?.id === updatedProfile.id
              ? updatedProfile
              : state.activeProfile,
        })),

      deleteProfile: (profileId) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
          activeProfile:
            state.activeProfile?.id === profileId
              ? (state.profiles.find((p) => p.id !== profileId) || null)
              : state.activeProfile,
        })),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "portal-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
