import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from "react-native-svg";
import { PH_GRADIENT_STOPS } from "../../lib/ph/spectrum";
import { PALETTE, FONTS } from "../../lib/theme/tokens";

type Props = {
  value?: number;
  height?: number;
  showScale?: boolean;
  animate?: boolean;
};

// Barra do espectro de pH (indicador universal) + marcador + shimmer.
export function PhSpectrum({ value = 7, height = 14, showScale = true, animate = false }: Props) {
  const pct = Math.max(0, Math.min(14, value)) / 14;
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const marker = useSharedValue(animate ? 0 : pct);
  useEffect(() => {
    marker.value = animate
      ? withTiming(pct, { duration: 800, easing: Easing.bezier(0.4, 1.2, 0.4, 1) })
      : pct;
  }, [pct, animate, marker]);
  const markerStyle = useAnimatedStyle(() => ({ left: `${marker.value * 100}%` }));

  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.linear }), -1, false);
  }, [shimmer]);
  const shimmerW = Math.max(60, w * 0.4);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-shimmerW, w + shimmerW]) }],
  }));

  return (
    <View onLayout={onLayout}>
      <View style={{ height, borderRadius: height / 2, overflow: "hidden" }}>
        <Svg width="100%" height={height}>
          <Defs>
            <SvgGradient id="ph" x1="0" y1="0" x2="1" y2="0">
              {PH_GRADIENT_STOPS.map((s) => (
                <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </SvgGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height={height} fill="url(#ph)" />
        </Svg>
        {w > 0 && (
          <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, width: shimmerW }, shimmerStyle]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>

      {/* Marcador */}
      <Animated.View style={[{ position: "absolute", top: -4, marginLeft: -4 }, markerStyle]}>
        <View
          style={{
            width: 8,
            height: height + 8,
            borderRadius: 4,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: 4, height: height + 4, borderRadius: 2, backgroundColor: PALETTE.ink }} />
        </View>
      </Animated.View>

      {showScale && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          {[0, 3.5, 7, 10.5, 14].map((n) => (
            <Text key={n} style={{ color: PALETTE.muted40, fontSize: 9, fontFamily: FONTS.regular }}>
              {n}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default PhSpectrum;
