// lib/strips/catalog.ts — Catálogo de modelos de tira de pH (dado de REFERÊNCIA).
//
// Cada modelo descreve a marca, a faixa, o nº de campos reativos (padCount) e a
// tabela de referência: para cada ponto de pH, as cores esperadas de cada campo.
// A leitura (analyzeStrip) casa a assinatura lida [c1..cN] contra essa tabela.
//
// Os modelos de 1 campo do indicador universal usam phToColor (preciso). O de 4
// campos (MN pH-Fix) e os marcados como `approximate` usam cores aproximadas —
// a precisão fina vem da calibração customizada (fase futura).

import { phToColor, hexToRgb, rgbToHex } from "../ph/spectrum";

export type RefPoint = { ph: number; pads: string[] };

export type StripModel = {
  id: string;
  brand: string;
  name: string;
  short: string;
  phRange: [number, number];
  padCount: number;
  padLabels?: string[];
  reference: RefPoint[];
  approximate: boolean;
  notes?: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const clampPh = (n: number) => Math.max(0, Math.min(14, n));

function buildRange(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) out.push(round2(v));
  return out;
}

function lerpColor(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

// Indicador universal, 1 campo (preciso — reusa phToColor).
function universalRef(step = 0.25): RefPoint[] {
  return buildRange(0, 14, step).map((ph) => ({ ph, pads: [phToColor(ph)] }));
}

// MN pH-Fix, 4 campos: assinatura aproximada (cada campo reage num ponto
// ligeiramente deslocado, gerando um padrão de 4 cores distinguível por pH).
function mnFourPadRef(step = 0.25): RefPoint[] {
  return buildRange(0, 14, step).map((ph) => ({
    ph,
    pads: [
      phToColor(clampPh(ph - 0.4)),
      phToColor(ph),
      phToColor(clampPh(ph + 0.25)),
      phToColor(clampPh(ph + 0.5)),
    ],
  }));
}

// pH de tira de piscina (fenol vermelho) — amarelo -> vermelho -> magenta.
const PHENOL_STOPS: { ph: number; color: string }[] = [
  { ph: 6.8, color: "#F2E84B" },
  { ph: 7.0, color: "#F2D24B" },
  { ph: 7.2, color: "#EFB24B" },
  { ph: 7.4, color: "#E88C4B" },
  { ph: 7.6, color: "#DE6253" },
  { ph: 7.8, color: "#CF4668" },
  { ph: 8.0, color: "#B83E86" },
  { ph: 8.2, color: "#9E3A9E" },
];

function phenolColor(ph: number): string {
  const stops = PHENOL_STOPS;
  if (ph <= stops[0].ph) return stops[0].color;
  if (ph >= stops[stops.length - 1].ph) return stops[stops.length - 1].color;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (ph >= a.ph && ph <= b.ph) {
      const t = (ph - a.ph) / (b.ph - a.ph);
      return lerpColor(a.color, b.color, t);
    }
  }
  return stops[stops.length - 1].color;
}

function phenolRef(step = 0.1): RefPoint[] {
  return buildRange(6.8, 8.2, step).map((ph) => ({ ph, pads: [phenolColor(ph)] }));
}

export const STRIP_MODELS: StripModel[] = [
  {
    id: "universal-0-14",
    brand: "Genérica",
    name: "Universal 0–14",
    short: "Universal",
    phRange: [0, 14],
    padCount: 1,
    reference: universalRef(),
    approximate: false,
    notes: "Tira de indicador universal, 1 campo reativo.",
  },
  {
    id: "mquant-universal-0-14",
    brand: "Merck · MQuant",
    name: "Universal pH 0–14 (non-bleeding)",
    short: "MQuant",
    phRange: [0, 14],
    padCount: 1,
    reference: universalRef(),
    approximate: true,
    notes: "Tira não-sangrante, 1 campo. Cores aproximadas do indicador universal.",
  },
  {
    id: "mn-phfix-0-14",
    brand: "Macherey-Nagel",
    name: "pH-Fix 0–14 (REF 92110)",
    short: "pH-Fix",
    phRange: [0, 14],
    padCount: 4,
    padLabels: ["Campo 1", "Campo 2", "Campo 3", "Campo 4"],
    reference: mnFourPadRef(),
    approximate: true,
    notes: "4 campos fixos. Referência aproximada — calibre para precisão fina.",
  },
  {
    id: "pool-phenol-red",
    brand: "Piscina/Spa",
    name: "pH fenol vermelho 6.8–8.2",
    short: "Piscina",
    phRange: [6.8, 8.2],
    padCount: 1,
    reference: phenolRef(),
    approximate: true,
    notes: "Campo de pH (fenol vermelho) das tiras multiparâmetro de piscina.",
  },
];

export const DEFAULT_STRIP_ID = "universal-0-14";

export function getStripModel(id: string | undefined | null): StripModel {
  return STRIP_MODELS.find((m) => m.id === id) ?? STRIP_MODELS[0];
}

// Pontos de referência amostrados para a prévia (poucas colunas representativas).
export function previewPoints(model: StripModel, count = 8): RefPoint[] {
  const [lo, hi] = model.phRange;
  const out: RefPoint[] = [];
  for (let i = 0; i < count; i++) {
    const ph = round2(lo + ((hi - lo) * i) / (count - 1));
    // ponto de referência mais próximo
    let best = model.reference[0];
    let bestD = Infinity;
    for (const r of model.reference) {
      const d = Math.abs(r.ph - ph);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    out.push(best);
  }
  return out;
}
