import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "../../components/ui/Icon";
import { PALETTE, FONTS } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { USE_CASES, phToColor, type UseCaseId } from "../../lib/ph/spectrum";
import { createSample } from "../../lib/db/queries";

const ICONS_BY_CASE: Record<UseCaseId, IconName[]> = {
  pool: ["pool", "spa", "wading", "droplet"],
  aquarium: ["plant", "fish", "betta", "droplet"],
};

export default function NewSampleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();
  const storeUseCase = useAppStore((s) => s.useCaseId);
  const bumpData = useAppStore((s) => s.bumpData);

  const [useCase, setUseCase] = useState<UseCaseId>(storeUseCase);
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const icons = ICONS_BY_CASE[useCase];
  const [icon, setIcon] = useState<IconName>(icons[0]);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createSample({
        name: name.trim(),
        sub: sub.trim(),
        useCase,
        icon,
        color: phToColor(USE_CASES[useCase].ideal),
      });
      bumpData();
      router.back();
    } catch {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Pressable onPress={() => router.back()} style={iconBtn}>
            <Icon name="chevL" size={18} />
          </Pressable>
          <Text style={{ fontSize: 12, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Novo local</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={{ fontFamily: FONTS.regular, fontSize: 28, color: PALETTE.ink, letterSpacing: -0.5, marginBottom: 18 }}>
          Local de amostra
        </Text>

        {/* Modo */}
        <Text style={label}>Modo</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {Object.values(USE_CASES).map((u) => {
            const active = useCase === u.id;
            return (
              <Pressable
                key={u.id}
                onPress={() => {
                  setUseCase(u.id);
                  setIcon(ICONS_BY_CASE[u.id][0]);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: active ? PALETTE.ink : "#F4F4F4",
                }}
              >
                <Icon name={u.samples[0].icon as IconName} size={20} color={active ? "#fff" : PALETTE.ink} strokeWidth={1.8} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: 12, color: active ? "#fff" : PALETTE.ink, marginTop: 4 }}>
                  {u.short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Nome */}
        <Text style={label}>Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={useCase === "pool" ? "Ex.: Piscina principal" : "Ex.: Plantado 200L"}
          placeholderTextColor={PALETTE.muted40}
          style={input}
        />

        {/* Local */}
        <Text style={label}>Local (opcional)</Text>
        <TextInput
          value={sub}
          onChangeText={setSub}
          placeholder="Ex.: Quintal · 32m³"
          placeholderTextColor={PALETTE.muted40}
          style={input}
        />

        {/* Ícone */}
        <Text style={label}>Ícone</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {icons.map((ic) => {
            const active = icon === ic;
            return (
              <Pressable
                key={ic}
                onPress={() => setIcon(ic)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? primary : "#F4F4F4",
                }}
              >
                <Icon name={ic} size={22} color={PALETTE.ink} strokeWidth={1.8} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => void onSave()}
          disabled={!canSave}
          style={{
            height: 54,
            borderRadius: 18,
            backgroundColor: PALETTE.ink,
            opacity: canSave ? 1 : 0.5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: FONTS.medium, fontSize: 15 }}>Salvar local</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: PALETTE.surface,
  borderWidth: 0.5,
  borderColor: "rgba(0,0,0,0.1)",
  alignItems: "center",
  justifyContent: "center",
} as const;

const label = {
  fontFamily: FONTS.regular,
  fontSize: 12,
  color: PALETTE.muted55,
  marginBottom: 8,
} as const;

const input = {
  height: 50,
  borderRadius: 14,
  backgroundColor: PALETTE.surface,
  borderWidth: 0.5,
  borderColor: "rgba(0,0,0,0.1)",
  paddingHorizontal: 14,
  fontFamily: FONTS.regular,
  fontSize: 15,
  color: PALETTE.ink,
  marginBottom: 16,
} as const;
