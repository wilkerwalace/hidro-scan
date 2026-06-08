import React from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Icon, type IconName } from "./Icon";
import { PALETTE } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";

type TabRoute = "index" | "samples" | "reminders" | "profile";
type Slot = { name?: TabRoute; icon: IconName; fab?: boolean };

const SLOTS: Slot[] = [
  { name: "index", icon: "grid" },
  { name: "samples", icon: "droplet" },
  { icon: "camera", fab: true },
  { name: "reminders", icon: "calendar" },
  { name: "profile", icon: "user" },
];

// tabBar custom do expo-router: 4 abas + FAB central (câmera -> /capture).
export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();
  const currentName = state.routes[state.index]?.name;

  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: insets.bottom + 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 28,
        paddingHorizontal: 14,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}
    >
      {SLOTS.map((slot) => {
        if (slot.fab) {
          return (
            <Pressable
              key="fab"
              onPress={() => router.push("/capture")}
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: PALETTE.ink,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -28,
                borderWidth: 2,
                borderColor: `${primary}33`,
                shadowColor: "#0A0A0A",
                shadowOpacity: 0.35,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 10,
              }}
            >
              <Icon name="camera" size={22} color="#fff" />
            </Pressable>
          );
        }
        const active = currentName === slot.name;
        return (
          <Pressable
            key={slot.name}
            onPress={() => {
              if (slot.name) navigation.navigate(slot.name as never);
            }}
            style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
          >
            <Icon name={slot.icon} size={22} color={active ? PALETTE.ink : "rgba(10,10,10,0.35)"} strokeWidth={active ? 2 : 1.6} />
            {active && (
              <View style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 4, backgroundColor: primary }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default BottomNav;
