// lib/strips/analyzeStrip.ts — amostragem da tira na FOTO CAPTURADA, com molde
// que pode ser movido, redimensionado E girado.
//
// A imagem é decodificada uma vez (decodeForSampling). Para cada campo, a cor é
// estimada por uma GRADE de pontos distribuídos sobre o retângulo (possivelmente
// girado) do campo — em cada ponto amostra-se um quadradinho alinhado ao eixo e
// faz-se a média (com rejeição de outliers). Assim o ângulo do molde é honrado.

import { Skia, AlphaType, ColorType, type SkImage } from "@shopify/react-native-skia";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { rgbToHex } from "../ph/spectrum";
import { matchSignature } from "./match";
import { STRIP_GEO } from "./geometry";
import type { StripModel } from "./catalog";

export type StripReading = { pads: string[]; ph: number; deltaE: number };
export type Fit = { x: number; y: number; w: number; h: number };
export type FrameSpec = { cx: number; cy: number; fw: number; fh: number; angle: number };

const NEAR_WHITE = 240;
const NEAR_BLACK = 14;
const SPECULAR_LUMA = 248;

export async function decodeForSampling(uri: string): Promise<SkImage> {
  const ctx = ImageManipulator.manipulate(uri).resize({ width: 720 });
  const rendered = await ctx.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.PNG, base64: true });
  if (!saved.base64) throw new Error("Falha ao processar a foto");
  const data = Skia.Data.fromBase64(saved.base64);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error("Falha ao decodificar a imagem");
  return image;
}

// Média de RGB (rejeição de outliers) de um retângulo NORMALIZADO. null se vazio.
export function avgRectRGB(
  image: SkImage,
  nx: number,
  ny: number,
  nw: number,
  nh: number
): [number, number, number] | null {
  const iw = image.width();
  const ih = image.height();
  let x = Math.round(nx * iw);
  let y = Math.round(ny * ih);
  let w = Math.max(1, Math.round(nw * iw));
  let h = Math.max(1, Math.round(nh * ih));
  x = Math.max(0, Math.min(iw - 1, x));
  y = Math.max(0, Math.min(ih - 1, y));
  if (x + w > iw) w = iw - x;
  if (y + h > ih) h = ih - y;

  const pixels = image.readPixels(x, y, {
    width: w,
    height: h,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels) return null;

  let sr = 0, sg = 0, sb = 0, kept = 0;
  let ar = 0, ag = 0, ab = 0, total = 0;
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    ar += r; ag += g; ab += b; total++;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const isWhite = r > NEAR_WHITE && g > NEAR_WHITE && b > NEAR_WHITE;
    const isBlack = r < NEAR_BLACK && g < NEAR_BLACK && b < NEAR_BLACK;
    if (isWhite || isBlack || luma > SPECULAR_LUMA) continue;
    sr += r; sg += g; sb += b; kept++;
  }
  if (kept >= Math.max(1, Math.floor(total * 0.1))) return [sr / kept, sg / kept, sb / kept];
  if (total > 0) return [ar / total, ag / total, ab / total];
  return null;
}

// Grade de amostragem dentro de cada campo (em frações dos meios-eixos).
const GRID_U = [-0.8, -0.4, 0, 0.4, 0.8];
const GRID_V = [-0.7, -0.35, 0, 0.35, 0.7];
const POINT = 0.012; // tamanho do quadradinho amostrado (normalizado)

// Lê os N campos a partir do molde (centro, tamanho, ângulo) em coords do
// container, mapeando para a imagem via o encaixe `fit` (translate+scale).
export function readPadsRotated(image: SkImage, fit: Fit, frame: FrameSpec, model: StripModel): StripReading {
  const { cx, cy, fw, fh, angle } = frame;
  // Eixos do molde (largura = u, altura = v).
  const ux = Math.cos(angle), uy = Math.sin(angle);
  const vx = -Math.sin(angle), vy = Math.cos(angle);

  const padCount = model.padCount;
  const segH = fh / padCount;
  const inset = segH * STRIP_GEO.padInsetY;
  const halfW = (fw * STRIP_GEO.sampleWidthFrac) / 2;

  const pads: string[] = [];
  for (let i = 0; i < padCount; i++) {
    const centerV = -fh / 2 + (i + 0.5) * segH;
    const halfH = (segH - 2 * inset) / 2;
    let R = 0, G = 0, B = 0, n = 0;
    for (const gu of GRID_U) {
      for (const gv of GRID_V) {
        const lu = gu * halfW;
        const lv = centerV + gv * halfH;
        const px = cx + lu * ux + lv * vx;
        const py = cy + lu * uy + lv * vy;
        const nx = (px - fit.x) / fit.w;
        const ny = (py - fit.y) / fit.h;
        const rgb = avgRectRGB(image, nx - POINT / 2, ny - POINT / 2, POINT, POINT);
        if (rgb) {
          R += rgb[0]; G += rgb[1]; B += rgb[2]; n++;
        }
      }
    }
    pads.push(n ? rgbToHex([R / n, G / n, B / n]) : "#808080");
  }

  const { ph, deltaE } = matchSignature(pads, model);
  return { pads, ph, deltaE };
}

// Confiança (0..1) a partir do Delta-E da correspondência.
export function confidenceFromDeltaE(deltaE: number): number {
  const raw = 0.95 - Math.min(0.5, Math.max(0, (deltaE - 6) / 50));
  return Math.round(Math.max(0.45, Math.min(0.95, raw)) * 100) / 100;
}
