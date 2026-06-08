// lib/strips/geometry.ts — geometria normalizada (frações 0..1) da tira e dos
// seus campos. Usada tanto pelas miras do viewfinder quanto pela amostragem da
// análise, garantindo que o que o usuário alinha é o que é lido.

export const STRIP_GEO = {
  centerX: 0.5, // centro horizontal da tira
  width: 0.26, // largura da tira (fração da largura)
  top: 0.3, // topo da área de campos (fração da altura)
  bottom: 0.7, // base da área de campos
  padInsetY: 0.18, // recorte vertical dentro de cada campo (evita as juntas)
  sampleWidthFrac: 0.62, // largura amostrada dentro da tira
};

export type RectN = { x: number; y: number; w: number; h: number };

// Retângulo (normalizado) de cada campo, de cima para baixo.
export function padRectsNorm(padCount: number): RectN[] {
  const g = STRIP_GEO;
  const x0 = g.centerX - g.width / 2;
  const segH = (g.bottom - g.top) / padCount;
  const out: RectN[] = [];
  for (let i = 0; i < padCount; i++) {
    const segTop = g.top + i * segH;
    const inset = segH * g.padInsetY;
    out.push({
      x: x0 + g.width * ((1 - g.sampleWidthFrac) / 2),
      y: segTop + inset,
      w: g.width * g.sampleWidthFrac,
      h: segH - 2 * inset,
    });
  }
  return out;
}
