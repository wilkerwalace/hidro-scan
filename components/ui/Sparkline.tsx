import React from "react";
import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { PALETTE } from "../../lib/theme/tokens";

type Props = {
  data: number[];
  height?: number;
  color?: string;
  accent?: string;
  mode?: "bars" | "line";
};

export function Sparkline({ data, height = 56, color = PALETTE.ink, accent = PALETTE.green, mode = "bars" }: Props) {
  if (!data || !data.length) return null;
  const max = Math.max(...data) + 0.2;
  const min = Math.min(...data) - 0.2;
  const range = Math.max(0.1, max - min);

  if (mode === "line") {
    const wv = 100;
    const pts = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * wv;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <Svg width="100%" height={height} viewBox={`0 0 ${wv} ${height}`} preserveAspectRatio="none">
        <Polyline points={pts} fill="none" stroke={color} strokeWidth={1.2} />
      </Svg>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height }}>
      {data.map((v, i) => {
        const h = ((v - min) / range) * (height - 4) + 4;
        const isLast = i === data.length - 1;
        const isAcc = i === data.length - 2 || i === data.length - 3;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              minWidth: 1,
              height: h,
              borderRadius: 1,
              backgroundColor: isLast ? accent : isAcc ? PALETTE.ink : "rgba(10,10,10,0.18)",
            }}
          />
        );
      })}
    </View>
  );
}

export default Sparkline;
