import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

import { Icon, toIconName } from "../../components/ui/Icon";
import { Card } from "../../components/ui/Card";
import { WaterWaves } from "../../components/ui/WaterWaves";
import { PALETTE, FONTS } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getReminders, getSamples, updateReminder, deleteReminder } from "../../lib/db/queries";
import type { Reminder, Sample } from "../../lib/db/schema";
import { ensureNotificationPermission, scheduleReminder, cancelNotifications, repeatLabel, type Repeat } from "../../lib/notifications";

const pad = (n: number) => String(n).padStart(2, "0");

function parseIds(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function Toggle({ enabled, primary, onToggle }: { enabled: boolean; primary: string; onToggle: () => void }) {
  const x = useSharedValue(enabled ? 18 : 0);
  useEffect(() => {
    x.value = withTiming(enabled ? 18 : 0, { duration: 200, easing: Easing.inOut(Easing.ease) });
  }, [enabled, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressable onPress={onToggle} style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: enabled ? primary : PALETTE.track, padding: 2, justifyContent: "center" }}>
      <Animated.View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: PALETTE.surface, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }, knob]} />
    </Pressable>
  );
}

export default function RemindersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const dataVersion = useAppStore((s) => s.dataVersion);

  const [list, setList] = useState<Reminder[]>([]);
  const [sampleMap, setSampleMap] = useState<Map<string, Sample>>(new Map());

  const load = useCallback(async () => {
    const [rems, ss] = await Promise.all([getReminders(useCaseId), getSamples(useCaseId)]);
    setList(rems);
    setSampleMap(new Map(ss.map((s) => [s.id, s])));
  }, [useCaseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load, dataVersion])
  );

  const onToggle = useCallback(
    async (r: Reminder) => {
      const ids = parseIds(r.notifIds);
      if (r.enabled === 1) {
        await cancelNotifications(ids);
        await updateReminder(r.id, { enabled: false, notifIds: [] });
      } else {
        const granted = await ensureNotificationPermission();
        let newIds: string[] = [];
        if (granted) {
          newIds = await scheduleReminder({
            hour: r.hour,
            minute: r.minute,
            repeat: r.repeat as Repeat,
            title: "Hora de medir o pH",
            body: `${r.label} · teste de pH`,
          });
        } else {
          Alert.alert("Notificações desativadas", "Ative as notificações para receber este lembrete.");
        }
        await updateReminder(r.id, { enabled: granted, notifIds: newIds });
      }
      await load();
    },
    [load]
  );

  const onDelete = useCallback(
    (r: Reminder) => {
      Alert.alert("Excluir lembrete", `Remover "${r.label}"?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await cancelNotifications(parseIds(r.notifIds));
            await deleteReminder(r.id);
            await load();
          },
        },
      ]);
    },
    [load]
  );

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 150 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 11, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Agenda de testes</Text>
            <Text style={{ fontFamily: FONTS.regular, fontSize: 32, color: PALETTE.ink, letterSpacing: -0.6, marginTop: 2, lineHeight: 34 }}>Lembretes</Text>
          </View>
          <Pressable onPress={() => router.push("/reminder/new")} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: PALETTE.ink, alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(10,10,10,0.04)" }}>
          <Icon name="info" size={14} color={PALETTE.muted55} />
          <Text style={{ flex: 1, fontSize: 11, color: PALETTE.muted60, fontFamily: FONTS.regular }}>
            Notificações push chegam em breve — por enquanto os lembretes ficam salvos aqui.
          </Text>
        </View>

        {list.length === 0 ? (
          <Card padding={22}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <Icon name="clock" size={28} color={PALETTE.muted40} strokeWidth={1.6} />
              <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: PALETTE.ink }}>Nenhum lembrete</Text>
              <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: PALETTE.muted60, textAlign: "center" }}>
                Toque no + para agendar testes recorrentes com aviso por notificação.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            {list.map((r) => {
              const sample = sampleMap.get(r.sampleId);
              return (
                <Card key={r.id} padding={14}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: sample?.color ?? PALETTE.track, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}>
                      <Icon name={toIconName(sample?.icon ?? "droplet")} size={20} color={PALETTE.ink} strokeWidth={1.8} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, color: PALETTE.ink, fontFamily: FONTS.medium }}>{r.label}</Text>
                      <Text style={{ fontSize: 11, color: PALETTE.muted50, fontFamily: FONTS.regular }}>
                        {pad(r.hour)}:{pad(r.minute)} · {repeatLabel(r.repeat)}
                      </Text>
                    </View>
                    <Pressable onPress={() => onDelete(r)} hitSlop={8} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
                      <Icon name="x" size={15} color="rgba(0,0,0,0.35)" />
                    </Pressable>
                    <Toggle enabled={r.enabled === 1} primary={primary} onToggle={() => void onToggle(r)} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <WaterWaves color={primary} height={180} opacity={1} />
    </View>
  );
}
