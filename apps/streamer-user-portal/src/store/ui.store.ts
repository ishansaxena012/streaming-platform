import { create } from "zustand";

interface UiState {
  sidebarExpanded: boolean;
  searchQuery: string;
  profileSelectOpen: boolean;
  accentColor: string;
  themeMode: "dark";

  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setProfileSelectOpen: (open: boolean) => void;
  setAccentColor: (color: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarExpanded: false,
  searchQuery: "",
  profileSelectOpen: false,
  accentColor: "#E50914", // default red
  themeMode: "dark",

  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setProfileSelectOpen: (profileSelectOpen) => set({ profileSelectOpen }),
  setAccentColor: (accentColor) => set({ accentColor }),
}));
