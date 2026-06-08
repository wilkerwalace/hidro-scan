import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path, Circle } from "react-native-svg";
import { PALETTE } from "../../lib/theme/tokens";

type Props = { size?: number; primary?: string };

// Logo: gota preta dentro de quadrado arredondado com gradiente verde.
export function Logo({ size = 36, primary = PALETTE.green }: Props) {
  return (
    <LinearGradient
      colors={[primary, "#C8FFD6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <Path d="M12 3s-7 8-7 13a7 7 0 1014 0c0-5-7-13-7-13z" fill={PALETTE.ink} />
        <Circle cx={9.5} cy={14} r={1.6} fill="rgba(255,255,255,0.5)" />
      </Svg>
    </LinearGradient>
  );
}

export default Logo;
