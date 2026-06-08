// lib/strips/match.ts — casa a assinatura de cores lida com a tabela de um modelo.

import { hexToRgb } from "../ph/spectrum";
import { rgbToLab, deltaE76 } from "../ph/colorMath";
import type { StripModel } from "./catalog";

// Dado os N campos lidos (hex), encontra o pH de menor soma média de Delta-E
// (CIELAB) contra os campos de referência de cada ponto de pH do modelo.
export function matchSignature(
  padColors: string[],
  model: StripModel
): { ph: number; deltaE: number } {
  const labs = padColors.map((c) => {
    const [r, g, b] = hexToRgb(c);
    return rgbToLab(r, g, b);
  });

  let best = { ph: model.reference[0]?.ph ?? 7, deltaE: Infinity };
  for (const ref of model.reference) {
    const n = Math.min(labs.length, ref.pads.length);
    if (n === 0) continue;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const [r, g, b] = hexToRgb(ref.pads[i]);
      total += deltaE76(labs[i], rgbToLab(r, g, b));
    }
    total /= n;
    if (total < best.deltaE) best = { ph: ref.ph, deltaE: total };
  }
  return best;
}
