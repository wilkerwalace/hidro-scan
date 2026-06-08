import React from "react";
import { View, Pressable, type ViewStyle, type StyleProp } from "react-native";
import { PALETTE, RADII, SHADOWS } from "../../lib/theme/tokens";

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  onPress?: () => void;
};

export function Card({ children, style, padding = 20, onPress }: Props) {
  const base: ViewStyle = {
    backgroundColor: PALETTE.surface,
    borderRadius: RADII.card,
    padding,
    borderWidth: 0.5,
    borderColor: PALETTE.hairline,
    ...SHADOWS.card,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} android_ripple={{ color: "rgba(0,0,0,0.06)" }} style={[base, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export default Card;
