// lib/ph/colorMath.ts — conversões de cor compartilhadas (sRGB -> Lab) e Delta-E.

export function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// sRGB (0..255) -> XYZ (D65) -> Lab.
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  let z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;

  x /= 0.95047;
  y /= 1.0;
  z /= 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// Distância euclidiana no espaço Lab (CIE76).
export function deltaE76(l1: [number, number, number], l2: [number, number, number]): number {
  const dL = l1[0] - l2[0];
  const da = l1[1] - l2[1];
  const db = l1[2] - l2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}
