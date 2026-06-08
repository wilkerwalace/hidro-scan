import React, { useEffect, useState } from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { PALETTE, RADII, SHADOWS } from "../../lib/theme/tokens";

type Vec = { x: number; y: number; s: number };

function Orb({
  primary,
  size,
  from,
  to,
  duration,
  delay = 0,
  intensity = 1,
}: {
  primary: string;
  size: number;
  from: Vec;
  to: Vec;
  duration: number;
  delay?: number;
  intensity?: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
  }, [t, duration, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [from.x, to.x]) },
      { translateY: interpolate(t.value, [0, 1], [from.y, to.y]) },
      { scale: interpolate(t.value, [0, 1], [from.s, to.s]) },
    ],
  }));

  return (
    <Animated.View style={[{ position: "absolute", width: size, height: size, opacity: intensity }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="orb" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={primary} stopOpacity={0.55} />
            <Stop offset="55%" stopColor={primary} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill="url(#orb)" />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  children?: React.ReactNode;
  primary?: string;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  intensity?: number;
  radius?: number;
  /** false = sem orbes animados (cards decorativos / listas longas). */
  animated?: boolean;
};

// Glass card: cartão branco com orbes de luz à deriva (gradiente radial SVG) +
// véu translúcido + realce de borda. `animated={false}` rende uma versão barata
// (sem orbes/sem medição) para decoração e telas com muitos cards.
export function GlassCard({
  children,
  primary = PALETTE.green,
  style,
  padding = 22,
  intensity = 1,
  radius = RADII.glass,
  animated = true,
}: Props) {
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const onLayout = animated
    ? (e: LayoutChangeEvent) => setDim({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
    : undefined;

  const base = Math.max(dim.w, dim.h) || 220;

  return (
    <View
      onLayout={onLayout}
      style={[
        { borderRadius: radius, overflow: "hidden", backgroundColor: PALETTE.surface, ...SHADOWS.glass },
        style,
      ]}
    >
      {animated && dim.w > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Orb
            primary={primary}
            size={base * 0.95}
            from={{ x: -base * 0.22, y: -base * 0.28, s: 0.9 }}
            to={{ x: base * 0.04, y: -base * 0.06, s: 1.12 }}
            duration={8000}
            intensity={intensity}
          />
          <Orb
            primary={primary}
            size={base}
            from={{ x: dim.w - base * 0.72, y: dim.h - base * 0.72, s: 1 }}
            to={{ x: dim.w - base * 0.5, y: dim.h - base * 0.88, s: 1.15 }}
            duration={11000}
            delay={400}
            intensity={intensity}
          />
          <Orb
            primary={primary}
            size={base * 0.7}
            from={{ x: dim.w * 0.18, y: dim.h * 0.32, s: 1 }}
            to={{ x: dim.w * 0.36, y: dim.h * 0.12, s: 0.92 }}
            duration={14000}
            delay={800}
            intensity={intensity}
          />
        </View>
      )}

      {/* Véu translúcido (frost sem blur — barato e estável) */}
      <LinearGradient
        pointerEvents="none"
        colors={
          animated
            ? ["rgba(255,255,255,0.16)", "rgba(255,255,255,0.5)"]
            : [`${primary}14`, "rgba(255,255,255,0.55)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Realce de borda interna */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)" },
        ]}
      />

      <View style={{ padding }}>{children}</View>
    </View>
  );
}

export default GlassCard;
