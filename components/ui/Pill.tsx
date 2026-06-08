import React from "react";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import { PALETTE } from "../../lib/theme/tokens";

type Props = {
  children?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Pílula. O conteúdo (Text/Icon) é fornecido pelo consumidor já com a cor certa.
export function Pill({ children, active = false, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: active ? PALETTE.ink : "rgba(255,255,255,0.7)",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: active ? 0 : 0.5,
          borderColor: "rgba(0,0,0,0.08)",
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export default Pill;
