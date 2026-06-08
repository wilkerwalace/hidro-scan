import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../components/ui/Icon";
import { StripModelList } from "../components/StripModelList";
import { PALETTE, FONTS } from "../lib/theme/tokens";
import { useAdaptiveColor } from "../lib/theme/useAdaptiveColor";
import { useAppStore } from "../store/useAppStore";
import { DEFAULT_STRIP_ID } from "../lib/strips/catalog";

export default function StripModelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();
  const stripModelId = useAppStore((s) => s.stripModelId) || DEFAULT_STRIP_ID;
  const setStripModelId = useAppStore((s) => s.setStripModelId);

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 40 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: PALETTE.surface,
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chevL" size={18} />
          </Pressable>
          <Text style={{ fontSize: 12, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Marca da tira</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={{ fontFamily: FONTS.regular, fontSize: 26, color: PALETTE.ink, letterSpacing: -0.5, marginBottom: 6 }}>
          Sua tira de teste
        </Text>
        <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: PALETTE.muted60, marginBottom: 18, lineHeight: 19 }}>
          Escolha o modelo que você usa. As miras da câmera e a leitura se ajustam aos campos da tira.
        </Text>

        <StripModelList selectedId={stripModelId} onSelect={setStripModelId} primary={primary} />
      </ScrollView>
    </View>
  );
}
