import { create } from "zustand";

export type CaptureSample = { id: string; name: string; icon: string };

// Sessão de captura: 1 foto -> alinhamento manual -> resultado.
type CaptureState = {
  sample: CaptureSample;
  flashOn: boolean;
  photoUri: string;
  photoW: number;
  photoH: number;
  finalPh: number;
  confidence: number;
  finalPads: string[];

  resetSession: (sample: CaptureSample) => void;
  setSample: (sample: CaptureSample) => void;
  setFlash: (b: boolean) => void;
  setPhoto: (p: { uri: string; w: number; h: number }) => void;
  setResult: (r: { ph: number; confidence: number; pads: string[] }) => void;
};

export const useCaptureStore = create<CaptureState>((set) => ({
  sample: { id: "", name: "", icon: "droplet" },
  flashOn: true,
  photoUri: "",
  photoW: 0,
  photoH: 0,
  finalPh: 7,
  confidence: 0,
  finalPads: [],

  resetSession: (sample) =>
    set({ sample, photoUri: "", photoW: 0, photoH: 0, finalPh: 7, confidence: 0, finalPads: [] }),
  setSample: (sample) => set({ sample }),
  setFlash: (b) => set({ flashOn: b }),
  setPhoto: (p) => set({ photoUri: p.uri, photoW: p.w, photoH: p.h }),
  setResult: (r) => set({ finalPh: r.ph, confidence: r.confidence, finalPads: r.pads }),
}));
