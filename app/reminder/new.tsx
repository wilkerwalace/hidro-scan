import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, toIconName } from "../../components/ui/Icon";
import { PALETTE, FONTS } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getSamples, createReminder } from "../../lib/db/queries";
import type { Sample } from "../../lib/db/schema";
import { ensureNotificationPermission, scheduleReminder, type Repeat } from "../../lib/notifications";

const REPEATS: { id: Repeat; label: string }[] = [
  { id: "daily", label: "Diário" },
  { id: "twice_week", label: "2x semana" },
  { id: "weekly", label: "Semanal" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function NewReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const bumpData = useAppStore((s) => s.bumpData);

  const [samples, setSamples] = useState<Sample[]>([]);
  const [sampleId, setSampleId] = useState<string>("");
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [repeat, setRepeat] = useState<Repeat>("daily");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getSamples(useCaseId).then((ss) => {
      setSamples(ss);
      if (ss.length) setSampleId(ss[0].id);
    });
  }, [useCaseId]);

  const stepHour = useCallback((d: number) => setHour((h) => (h + d + 24) % 24), []);
  const stepMinute = useCallback((d: number) => setMinute((m) => (m + d + 60) % 60), []);

  const sample = samples.find((s) => s.id === sampleId);
  const canSave = !!sample && !saving;

  const onSave = async () => {
    if (!sample || saving) return;
    setSaving(true);
    try {
      const granted = await ensureNotificationPermission();
      const title = "Hora de medir o pH";
      const body = `${sample.name} · teste de pH`;
      let notifIds: string[] = [];
      if (granted) {
        notifIds = await scheduleReminder({ hour, minute, repeat, title, body });
      }
      await createReminder({
        sampleId: sample.id,
        label: sample.name,
        hour,
        minute,
        repeat,
        enabled: granted,
        notifIds,
      });
      bumpData();
      if (!granted) {
        Alert.alert("Notificações desativadas", "O lembrete foi salvo, mas ative as notificações nas configurações para ser avisado.");
      }
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível criar o lembrete.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Pressable onPress={() => router.back()} style={iconBtn}>
            <Icon name="chevL" size={18} />
          </Pressable>
          <Text style={{ fontSize: 12, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Novo lembrete</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={{ fontFamily: FONTS.regular, fontSize: 28, color: PALETTE.ink, letterSpacing: -0.5, marginBottom: 18 }}>
          Lembrete de teste
        </Text>

        {samples.length === 0 ? (
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 30 }}>
            <Icon name="droplet" size={30} color={PALETTE.muted40} />
            <Text style={{ color: PALETTE.muted55, fontFamily: FONTS.regular, textAlign: "center" }}>
              Crie um local de amostra antes de agendar um lembrete.
            </Text>
            <Pressable onPress={() => router.replace("/sample/new")} style={{ marginTop: 6, backgroundColor: PALETTE.ink, paddingHorizontal: 18, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontFamily: FONTS.medium }}>Criar local</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Local */}
            <Text style={label}>Local</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {samples.map((s) => {
                const active = sampleId === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSampleId(s.id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 38, borderRadius: 999, backgroundColor: active ? PALETTE.ink : PALETTE.surface, borderWidth: active ? 0 : 0.5, borderColor: "rgba(0,0,0,0.1)" }}
                  >
                    <Icon name={toIconName(s.icon)} size={14} color={active ? "#fff" : PALETTE.ink} strokeWidth={1.8} />
                    <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: active ? "#fff" : PALETTE.ink }}>{s.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Horário */}
            <Text style={label}>Horário</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 18 }}>
              <Stepper value={pad(hour)} onMinus={() => stepHour(-1)} onPlus={() => stepHour(1)} primary={primary} />
              <Text style={{ fontFamily: FONTS.light, fontSize: 30, color: PALETTE.ink }}>:</Text>
              <Stepper value={pad(minute)} onMinus={() => stepMinute(-5)} onPlus={() => stepMinute(5)} primary={primary} />
            </View>

            {/* Recorrência */}
            <Text style={label}>Recorrência</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
              {REPEATS.map((r) => {
                const active = repeat === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setRepeat(r.id)}
                    style={{ flex: 1, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: active ? PALETTE.ink : "#F4F4F4" }}
                  >
                    <Text style={{ fontFamily: FONTS.medium, fontSize: 12, color: active ? "#fff" : PALETTE.ink }}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => void onSave()}
              disabled={!canSave}
              style={{ height: 54, borderRadius: 18, backgroundColor: PALETTE.ink, opacity: canSave ? 1 : 0.5, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
            >
              <Icon name="bell" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontFamily: FONTS.medium, fontSize: 15 }}>Criar lembrete</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stepper({ value, onMinus, onPlus, primary }: { value: string; onMinus: () => void; onPlus: () => void; primary: string }) {
  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <Pressable onPress={onPlus} style={stepBtn(primary)}>
        <Icon name="plus" size={16} color={PALETTE.ink} />
      </Pressable>
      <Text style={{ fontFamily: FONTS.light, fontSize: 40, color: PALETTE.ink, fontVariant: ["tabular-nums"], minWidth: 60, textAlign: "center" }}>{value}</Text>
      <Pressable onPress={onMinus} style={stepBtn(primary)}>
        <View style={{ width: 14, height: 2, borderRadius: 1, backgroundColor: PALETTE.ink }} />
      </Pressable>
    </View>
  );
}

const stepBtn = (primary: string) =>
  ({
    width: 44,
    height: 36,
    borderRadius: 12,
    backgroundColor: primary,
    alignItems: "center",
    justifyContent: "center",
  }) as const;

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
