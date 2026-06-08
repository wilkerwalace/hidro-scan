import React, { useEffect, useState } from "react";
import { View, StyleSheet, type LayoutChangeEvent } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { PALETTE } from "../../lib/theme/tokens";
import { hexToRgb } from "../../lib/ph/spectrum";

function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Caminho de 4 ciclos senoidais (viewBox 0..2400, período 600).
function wavePath(yMid: number, amp: number) {
  let d = `M0,${yMid} `;
  for (let i = 0; i < 4; i++) {
    const x1 = i * 600 + 150, y1 = yMid - amp;
    const x2 = i * 600 + 300, y2 = yMid;
    const x3 = i * 600 + 450, y3 = yMid + amp;
    const x4 = i * 600 + 600, y4 = yMid;
    d += `Q ${x1},${y1} ${x2},${y2} Q ${x3},${y3} ${x4},${y4} `;
  }
  d += `L 2400,200 L 0,200 Z`;
  return d;
}

function WaveLayer({
  w,
  height,
  color,
  yMid,
  amp,
  fillOpacity,
  duration,
}: {
  w: number;
  height: number;
  color: string;
  yMid: number;
  amp: number;
  fillOpacity: number;
  duration: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, [t, duration]);
  // Deslize de um período (0.5*w) para emenda perfeita.
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -t.value * w * 0.5 }] }));

  return (
    <Animated.View style={[{ position: "absolute", bottom: 0, left: 0, width: w * 2, height }, style]}>
      <Svg width={w * 2} height={height} viewBox="0 0 2400 200" preserveAspectRatio="none">
        <Path d={wavePath(yMid, amp)} fill={color} fillOpacity={fillOpacity} />
      </Svg>
    </Animated.View>
  );
}

type Props = { color?: string; height?: number; opacity?: number };

// Ondas ambientes no rodapé, tingidas pela média de pH. Atrás da BottomNav.
export function WaterWaves({ color = PALETTE.green, height = 180, opacity = 1 }: Props) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height, overflow: "hidden" }}
    >
      <LinearGradient
        colors={["transparent", rgba(color, 0.06 * opacity), rgba(color, 0.16 * opacity)]}
        style={StyleSheet.absoluteFill}
      />
      {w > 0 && (
        <>
          <WaveLayer w={w} height={height} color={color} yMid={120} amp={22} fillOpacity={0.16 * opacity} duration={9000} />
          <WaveLayer w={w} height={height} color={color} yMid={140} amp={18} fillOpacity={0.22 * opacity} duration={7000} />
          <WaveLayer w={w} height={height} color={color} yMid={160} amp={14} fillOpacity={0.32 * opacity} duration={5000} />
        </>
      )}
    </View>
  );
}

export default WaterWaves;
