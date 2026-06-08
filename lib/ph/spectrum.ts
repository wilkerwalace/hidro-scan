// lib/ph/spectrum.ts — Ciência do pH: espectro (indicador universal 0–14),
// conversões de cor, classificação, casos de uso e recomendações.
// Porte fiel de design_handoff_hidro_scan/data.js para TypeScript.

export type RGB = [number, number, number];
export type PhStop = { ph: number; color: string };
export type UseCaseId = "pool" | "aquarium";
export type Level = "ideal" | "ok" | "low" | "high";

// ──────────────────────────────────────────────────────────────
// Espectro de cor do pH (aproximação da tira de indicador universal)
// ──────────────────────────────────────────────────────────────
export const PH_STOPS: PhStop[] = [
  { ph: 0, color: "#C71F2D" },
  { ph: 1, color: "#E0331D" },
  { ph: 2, color: "#EC5A1B" },
  { ph: 3, color: "#F08A1B" },
  { ph: 4, color: "#F1B72A" },
  { ph: 5, color: "#D6C736" },
  { ph: 6, color: "#A6CA47" },
  { ph: 7, color: "#5DBE6E" },
  { ph: 8, color: "#2EA38E" },
  { ph: 9, color: "#2477B0" },
  { ph: 10, color: "#2456B3" },
  { ph: 11, color: "#3A3AAE" },
  { ph: 12, color: "#5331A4" },
  { ph: 13, color: "#5A1F84" },
  { ph: 14, color: "#3F1456" },
];

// Paradas normalizadas (offset 0..1) para LinearGradient SVG.
export const PH_GRADIENT_STOPS = PH_STOPS.map((s, i) => ({
  offset: i / 14,
  color: s.color,
}));

export function hexToRgb(h: string): RGB {
  const x = h.replace("#", "");
  return [
    parseInt(x.slice(0, 2), 16),
    parseInt(x.slice(2, 4), 16),
    parseInt(x.slice(4, 6), 16),
  ];
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Interpola linearmente o espectro -> cor para um pH contínuo.
export function phToColor(ph: number): string {
  ph = Math.max(0, Math.min(14, ph));
  const i = Math.floor(ph);
  const t = ph - i;
  const a = hexToRgb(PH_STOPS[Math.min(i, 13)].color);
  const b = hexToRgb(PH_STOPS[Math.min(i + 1, 14)].color);
  return rgbToHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
}

// ──────────────────────────────────────────────────────────────
// Casos de uso (alternáveis)
// ──────────────────────────────────────────────────────────────
export type UseCaseSample = {
  id: string;
  name: string;
  sub: string;
  icon: string;
  last: number;
  trend: number;
  color: string;
};

export type Tip = { title: string; body: string };

export type UseCase = {
  id: UseCaseId;
  name: string;
  short: string;
  sampleLabel: string;
  safeRange: [number, number];
  okRange: [number, number];
  ideal: number;
  intro: string;
  samples: UseCaseSample[];
  tips: { low: Tip; ok: Tip; high: Tip };
};

export const USE_CASES: Record<UseCaseId, UseCase> = {
  pool: {
    id: "pool",
    name: "Piscina & Spa",
    short: "Piscina",
    sampleLabel: "Piscina",
    safeRange: [7.2, 7.6],
    okRange: [7.0, 7.8],
    ideal: 7.4,
    intro: "Mantenha a piscina cristalina e segura para nadar.",
    samples: [
      { id: "s1", name: "Piscina principal", sub: "Quintal · 32m³", icon: "pool", last: 7.42, trend: 0.05, color: "#5DBE6E" },
      { id: "s2", name: "Spa aquecido", sub: "Varanda · 1.8m³", icon: "spa", last: 7.78, trend: 0.21, color: "#2EA38E" },
      { id: "s3", name: "Piscina infantil", sub: "Jardim · 0.6m³", icon: "wading", last: 6.92, trend: -0.18, color: "#A6CA47" },
    ],
    tips: {
      low: { title: "Adicionar barrilha leve", body: "pH abaixo de 7.2 acelera corrosão e irrita olhos. Adicione 80g de bicarbonato de sódio por m³ e re-teste em 6h." },
      ok: { title: "Faixa ideal mantida", body: "Continue com a rotina semanal. Cloro livre deve seguir entre 1–3 ppm." },
      high: { title: "Reduzir com ácido muriático", body: "pH acima de 7.6 reduz eficácia do cloro. Adicione 25ml/m³ de redutor de pH e teste em 4h." },
    },
  },
  aquarium: {
    id: "aquarium",
    name: "Aquário",
    short: "Aquário",
    sampleLabel: "Aquário",
    safeRange: [6.8, 7.4],
    okRange: [6.5, 7.8],
    ideal: 7.0,
    intro: "Monitore o pH para a saúde dos seus peixes e plantas.",
    samples: [
      { id: "a1", name: "Plantado 200L", sub: "Sala · CO² ativo", icon: "plant", last: 6.84, trend: -0.06, color: "#A6CA47" },
      { id: "a2", name: "Marinho recifal", sub: "Escritório · 150L", icon: "fish", last: 8.22, trend: 0.04, color: "#2477B0" },
      { id: "a3", name: "Bettário", sub: "Quarto · 5L individual", icon: "betta", last: 7.05, trend: 0.02, color: "#5DBE6E" },
    ],
    tips: {
      low: { title: "Aumentar dureza KH", body: "Adicione 1 colher de bicarbonato dissolvido para 50L. Faça TPA de 10% antes para diluir orgânicos." },
      ok: { title: "pH estável", body: "Os habitantes estão confortáveis. Monitore semanalmente e observe coloração e apetite." },
      high: { title: "Reduzir com troca parcial", body: "TPA de 20% com água osmose por 3 dias. Verifique se substrato calcário está elevando dureza." },
    },
  },
};

// ──────────────────────────────────────────────────────────────
// Classificação e recomendação
// ──────────────────────────────────────────────────────────────
export type Classification = { level: Level; label: string; color: string };

export function classify(ph: number, uc: UseCase): Classification {
  const [sLo, sHi] = uc.safeRange;
  const [oLo, oHi] = uc.okRange;
  if (ph >= sLo && ph <= sHi) return { level: "ideal", label: "Ideal", color: "#5DBE6E" };
  if (ph >= oLo && ph <= oHi) return { level: "ok", label: "Aceitável", color: "#D6C736" };
  if (ph < oLo) return { level: "low", label: "Ácido", color: "#E0331D" };
  return { level: "high", label: "Básico", color: "#3A3AAE" };
}

export function recommendation(ph: number, uc: UseCase): Tip {
  const c = classify(ph, uc);
  if (c.level === "low") return uc.tips.low;
  if (c.level === "high") return uc.tips.high;
  return uc.tips.ok;
}

// ──────────────────────────────────────────────────────────────
// Geração de histórico (usado no seed do SQLite)
// Retorna pontos com daysAgo (0 = hoje) para o seed converter em ts.
// ──────────────────────────────────────────────────────────────
export function genHistory(seed: number, base: number, jitter = 0.25): { daysAgo: number; ph: number }[] {
  const out: { daysAgo: number; ph: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const noise = (Math.sin(seed + i * 0.7) + Math.cos(seed * 1.3 + i * 0.4)) * 0.5;
    const v = base + noise * jitter;
    out.push({ daysAgo: i, ph: Math.round(v * 100) / 100 });
  }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Cor primária adaptativa (derivada da média de pH das amostras)
// ──────────────────────────────────────────────────────────────
export function adaptiveColor(phs: number[]): string {
  if (!phs.length) return "#76FB91";
  const avg = phs.reduce((a, b) => a + b, 0) / phs.length;
  const base = phToColor(avg);
  const [r, g, b] = hexToRgb(base);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.18);
  return rgbToHex([mix(r), mix(g), mix(b)]);
}
