import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { PALETTE } from "../../lib/theme/tokens";

type Props = {
  value?: number; // 0..1
  height?: number;
  primary?: string;
  animate?: boolean;
};

// Barra de progresso: preenchimento preto + tick verde sobre trilho cinza.
export function MiniBar({ value = 0.5, height = 6, primary = PALETTE.green, animate = false }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  const t = useSharedValue(animate ? 0 : pct);

  useEffect(() => {
    if (animate) {
      t.value = withTiming(pct, { duration: 600, easing: Easing.bezier(0.4, 1.2, 0.4, 1) });
    } else {
      t.value = pct;
    }
  }, [pct, animate, t]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${t.value * 100}%` }));
  const tickStyle = useAnimatedStyle(() => ({ left: `${t.value * 100}%` }));

  return (
    <View style={{ height, borderRadius: height, overflow: "hidden", backgroundColor: PALETTE.track }}>
      <Animated.View
        style={[
          { position: "absolute", top: 0, bottom: 0, left: 0, backgroundColor: PALETTE.ink, borderRadius: height },
          fillStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 4,
            marginLeft: -2,
            backgroundColor: primary,
            borderRadius: 2,
          },
          tickStyle,
        ]}
      />
    </View>
  );
}

export default MiniBar;
