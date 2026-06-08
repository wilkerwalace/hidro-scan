import { create } from "zustand";
import { saveSetting } from "../lib/db/settings";
import type { UseCaseId } from "../lib/ph/spectrum";

export type ColorMode = "fixed" | "adaptive" | "alt";

type HydratePayload = {
  useCaseId?: UseCaseId;
  colorMode?: ColorMode;
  onboarded?: boolean;
  name?: string;
  email?: string;
  stripModelId?: string;
};

type AppState = {
  ready: boolean;
  onboarded: boolean;
  useCaseId: UseCaseId;
  colorMode: ColorMode;
  name: string;
  email: string;
  stripModelId: string;
  /** Incrementa após mutações no banco para disparar refetch nas telas. */
  dataVersion: number;

  setReady: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setUseCaseId: (v: UseCaseId) => void;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setStripModelId: (v: string) => void;
  bumpData: () => void;
  resetAll: () => void;
  hydrate: (p: HydratePayload) => void;
};

export const useAppStore = create<AppState>((set) => ({
  ready: false,
  onboarded: false,
  useCaseId: "pool",
  colorMode: "fixed",
  name: "",
  email: "",
  stripModelId: "",
  dataVersion: 0,

  setReady: (v) => set({ ready: v }),

  setOnboarded: (v) => {
    set({ onboarded: v });
    void saveSetting("onboarded", v ? "1" : "0");
  },

  setUseCaseId: (v) => {
    set({ useCaseId: v });
    void saveSetting("useCase", v);
  },

  setName: (v) => {
    set({ name: v });
    void saveSetting("name", v);
  },

  setEmail: (v) => {
    set({ email: v });
    void saveSetting("email", v);
  },

  setStripModelId: (v) => {
    set({ stripModelId: v });
    void saveSetting("stripModelId", v);
  },

  bumpData: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),

  resetAll: () =>
    set((s) => ({
      onboarded: false,
      name: "",
      email: "",
      useCaseId: "pool",
      stripModelId: "",
      colorMode: "fixed",
      dataVersion: s.dataVersion + 1,
    })),

  hydrate: (p) =>
    set((s) => ({
      useCaseId: p.useCaseId ?? s.useCaseId,
      colorMode: p.colorMode ?? s.colorMode,
      onboarded: p.onboarded ?? s.onboarded,
      name: p.name ?? s.name,
      email: p.email ?? s.email,
      stripModelId: p.stripModelId ?? s.stripModelId,
    })),
}));
