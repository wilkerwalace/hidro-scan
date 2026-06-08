// components/ui/Icon.tsx — set de ícones de traço, portado para react-native-svg.
// Mesmo desenho do handoff (components.jsx). strokeWidth 1.6 por padrão.
import React from "react";
import { Svg, Path, Circle, Rect } from "react-native-svg";

export type IconName =
  | "bell" | "bolt" | "plus" | "chevR" | "chevL"
  | "arrowUR" | "camera" | "flash" | "flashOff" | "clock" | "calendar" | "user"
  | "grid" | "flask" | "droplet" | "check" | "x" | "target" | "info"
  | "sparkle" | "history" | "trend" | "shield" | "pool" | "spa"
  | "wading" | "plant" | "fish" | "betta" | "arrowUp" | "arrowDown";

const ICON_NAMES = new Set<IconName>([
  "bell", "bolt", "plus", "chevR", "chevL", "arrowUR", "camera", "flash", "flashOff",
  "clock", "calendar", "user", "grid", "flask", "droplet", "check", "x", "target",
  "info", "sparkle", "history", "trend", "shield", "pool", "spa", "wading", "plant",
  "fish", "betta", "arrowUp", "arrowDown",
]);

// Converte uma string (ex.: vinda do banco) num IconName válido, com fallback
// visível — evita render de <Svg> vazio silencioso em nome inesperado.
export function toIconName(s: string): IconName {
  return ICON_NAMES.has(s as IconName) ? (s as IconName) : "droplet";
}

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 18, color = "#0A0A0A", strokeWidth = 1.6 }: Props) {
  const p = {
    stroke: color,
    fill: "none" as const,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const content: Record<IconName, React.ReactNode> = {
    bell: (<>
      <Path {...p} d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" />
      <Path {...p} d="M10 18a2 2 0 004 0" />
    </>),
    bolt: <Path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
    plus: <Path {...p} d="M12 5v14M5 12h14" />,
    chevR: <Path {...p} d="M9 6l6 6-6 6" />,
    chevL: <Path {...p} d="M15 6l-6 6 6 6" />,
    arrowUR: <Path {...p} d="M7 17L17 7M9 7h8v8" />,
    camera: (<>
      <Path {...p} d="M3 7h3l2-2h8l2 2h3v12H3z" />
      <Circle cx={12} cy={13} r={4} {...p} />
    </>),
    flash: <Path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
    flashOff: (<>
      <Path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      <Path {...p} d="M3 3l18 18" />
    </>),
    clock: (<>
      <Circle cx={12} cy={12} r={9} {...p} />
      <Path {...p} d="M12 7v5l3 2" />
    </>),
    calendar: (<>
      <Rect x={3} y={5} width={18} height={16} rx={2} {...p} />
      <Path {...p} d="M8 3v4M16 3v4M3 11h18" />
    </>),
    user: (<>
      <Circle cx={12} cy={8} r={4} {...p} />
      <Path {...p} d="M4 21a8 8 0 0116 0" />
    </>),
    grid: (<>
      <Rect x={3} y={3} width={7} height={7} rx={1.4} {...p} />
      <Rect x={14} y={3} width={7} height={7} rx={1.4} {...p} />
      <Rect x={3} y={14} width={7} height={7} rx={1.4} {...p} />
      <Rect x={14} y={14} width={7} height={7} rx={1.4} {...p} />
    </>),
    flask: (<>
      <Path {...p} d="M9 3v6L4 19a2 2 0 002 2h12a2 2 0 002-2L15 9V3" />
      <Path {...p} d="M9 3h6" />
    </>),
    droplet: <Path {...p} d="M12 3s-7 8-7 13a7 7 0 1014 0c0-5-7-13-7-13z" />,
    check: <Path {...p} d="M5 12l5 5L20 7" />,
    x: <Path {...p} d="M6 6l12 12M18 6L6 18" />,
    target: (<>
      <Circle cx={12} cy={12} r={9} {...p} />
      <Circle cx={12} cy={12} r={5} {...p} />
      <Circle cx={12} cy={12} r={1} {...p} />
    </>),
    info: (<>
      <Circle cx={12} cy={12} r={9} {...p} />
      <Path {...p} d="M12 8v.5M12 11v5" />
    </>),
    sparkle: <Path {...p} d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z" />,
    history: (<>
      <Path {...p} d="M3 12a9 9 0 109-9c-3 0-5.5 1.5-7 3.5" />
      <Path {...p} d="M3 4v4h4M12 8v4l3 2" />
    </>),
    trend: (<>
      <Path {...p} d="M3 17l6-6 4 4 8-8" />
      <Path {...p} d="M14 7h7v7" />
    </>),
    shield: <Path {...p} d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />,
    pool: (<>
      <Rect x={3} y={8} width={18} height={12} rx={2} {...p} />
      <Path {...p} d="M3 12c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
      <Path {...p} d="M3 16c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
    </>),
    spa: (<>
      <Path {...p} d="M4 11h16M5 11v6a3 3 0 003 3h8a3 3 0 003-3v-6" />
      <Path {...p} d="M9 4c1 1.5 1 3 0 4M13 4c1 1.5 1 3 0 4" />
    </>),
    wading: (<>
      <Circle cx={12} cy={13} r={7} {...p} />
      <Path {...p} d="M7 13c2-1 3-1 5 0s3 1 5 0" />
    </>),
    plant: (<>
      <Path {...p} d="M12 21V11" />
      <Path {...p} d="M12 11C12 6 8 4 4 4c0 4 2 8 8 8M12 11c0-5 4-7 8-7 0 4-2 8-8 7" />
    </>),
    fish: (<>
      <Path {...p} d="M17 8c-4 0-9 1.5-11 4 2 2.5 7 4 11 4l3-4z" />
      <Circle cx={13} cy={11} r={0.8} fill={color} stroke="none" />
      <Path {...p} d="M6 12L3 9M6 12l-3 3" />
    </>),
    betta: (<>
      <Path {...p} d="M14 8c-3 0-6 1.5-8 4 2 2.5 5 4 8 4l2-4z" />
      <Path {...p} d="M16 8l4-3v14l-4-3" />
      <Circle cx={11} cy={11} r={0.8} fill={color} stroke="none" />
    </>),
    arrowUp: <Path {...p} d="M12 19V5M5 12l7-7 7 7" />,
    arrowDown: <Path {...p} d="M12 5v14M5 12l7 7 7-7" />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content[name]}
    </Svg>
  );
}

export default Icon;
