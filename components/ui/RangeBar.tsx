import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PALETTE, FONTS } from "../../lib/theme/tokens";
import { hexToRgb } from "../../lib/ph/spectrum";

function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

type Props = { low: number; high: number; value: number; primary?: string };

// Barra horizontal com banda segura + marcador (preto dentro / vermelho fora).
export function RangeBar({ low, high, value, primary = PALETTE.green }: Props) {
  const min = Math.min(low - 1.5, value - 0.5);
  const max = Math.max(high + 1.5, value + 0.5);
  const span = max - min;
  const lpct = ((low - min) / span) * 100;
  const hpct = ((high - min) / span) * 100;
  const vpct = ((value - min) / span) * 100;
  const inRange = value >= low && value <= high;

  return (
    <View>
      <View style={{ height: 36, backgroundColor: "#F4F4F4", borderRadius: 12, overflow: "hidden" }}>
        <LinearGradient
          colors={[rgba(primary, 0.27), rgba(primary, 0.53)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${lpct}%`,
            width: `${hpct - lpct}%`,
            borderLeftWidth: 1.5,
            borderRightWidth: 1.5,
            borderColor: primary,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: -2,
            bottom: -2,
            left: `${vpct}%`,
            marginLeft: -3,
            width: 6,
            borderRadius: 3,
            backgroundColor: inRange ? PALETTE.ink : PALETTE.acid,
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>{min.toFixed(1)}</Text>
        <Text style={{ fontSize: 10, color: primary === PALETTE.green ? PALETTE.trendUp : primary, fontFamily: FONTS.medium }}>
          Faixa ideal {low}–{high}
        </Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>{max.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export default RangeBar;
