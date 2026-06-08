import React from "react";
import { View, Text } from "react-native";
import { PALETTE, FONTS } from "../../lib/theme/tokens";

type Props = {
  value: string | number;
  unit?: string;
  size?: number;
  color?: string;
};

// Número grande com sobrescrito (unidade), tabular-nums, letter-spacing negativo.
export function BigStat({ value, unit = "%", size = 48, color = PALETTE.ink }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text
        style={{
          fontFamily: FONTS.light,
          fontSize: size,
          lineHeight: size,
          color,
          letterSpacing: size * -0.02,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      {unit ? (
        <Text
          style={{
            fontFamily: FONTS.regular,
            fontSize: size * 0.32,
            marginTop: 2,
            marginLeft: 2,
            color,
          }}
        >
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

export default BigStat;
