// lib/theme/tokens.ts — Design tokens (espelho de "Design Tokens" do handoff)
// para uso em estilos inline (componentes animados via Reanimated/SVG).

export const PALETTE = {
  ink: "#0A0A0A",
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  green: "#76FB91",
  warm: "#FFD66B",
  // Status (classificação de pH)
  ideal: "#5DBE6E",
  ok: "#D6C736",
  acid: "#E0331D",
  base: "#3A3AAE",
  trendUp: "#2EA38E",
  trendDown: "#E0331D",
  // Texto secundário
  muted40: "rgba(10,10,10,0.40)",
  muted50: "rgba(10,10,10,0.50)",
  muted55: "rgba(10,10,10,0.55)",
  muted60: "rgba(10,10,10,0.60)",
  muted65: "rgba(10,10,10,0.65)",
  hairline: "rgba(0,0,0,0.06)",
  track: "#EDEDED",
} as const;

export const RADII = {
  card: 22,
  glass: 24,
  pill: 999,
  chip: 14,
  btn: 18,
} as const;

export const SHADOWS = {
  card: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  glass: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  black: { shadowColor: "#0A0A0A", shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
} as const;

export const SPACING = {
  screenX: 18,
  top: 70,
  bottom: 110,
} as const;

export const FONTS = {
  light: "Outfit_300Light",
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  semibold: "Outfit_600SemiBold",
} as const;

// Número com vírgula decimal pt-BR e 2 casas.
export function fmtPh(ph: number): string {
  return ph.toFixed(2).replace(".", ",");
}

// Iniciais do nome para avatar (1-2 letras).
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Tempo relativo curto (agora, min, h, d, data).
export function formatRelative(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d`;
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
