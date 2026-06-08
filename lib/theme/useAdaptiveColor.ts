import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { USE_CASES, adaptiveColor } from "../ph/spectrum";
import { PALETTE } from "./tokens";

// Cor primária do app conforme o modo selecionado.
// 'adaptive' deriva da média de pH das amostras do caso de uso atual.
export function useAdaptiveColor(): string {
  const colorMode = useAppStore((s) => s.colorMode);
  const useCaseId = useAppStore((s) => s.useCaseId);

  return useMemo(() => {
    if (colorMode === "adaptive") {
      return adaptiveColor(USE_CASES[useCaseId].samples.map((s) => s.last));
    }
    if (colorMode === "alt") return PALETTE.warm;
    return PALETTE.green;
  }, [colorMode, useCaseId]);
}
