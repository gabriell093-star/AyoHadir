import { create } from "zustand";

type AppState = {
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline })
}));
