import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

import { Icon, toIconName } from "../../components/ui/Icon";
import { GlassCard } from "../../components/ui/GlassCard";
import { Card } from "../../components/ui/Card";
import { CardHeader } from "../../components/ui/CardHeader";
import { BigStat } from "../../components/ui/BigStat";
import { PhSpectrum } from "../../components/ui/PhSpectrum";
import { RangeBar } from "../../components/ui/RangeBar";
import { PALETTE, FONTS, fmtPh } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { USE_CASES, classify, recommendation, phToColor } from "../../lib/ph/spectrum";
import { getStripModel } from "../../lib/strips/catalog";
import { saveReading } from "../../lib/db/queries";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureStore } from "../../store/captureStore";

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();

  const useCaseId = useAppStore((s) => s.useCaseId);
  const stripModelId = useAppStore((s) => s.stripModelId);
  const bumpData = useAppStore((s) => s.bumpData);
  const uc = USE_CASES[useCaseId];
  const model = getStripModel(stripModelId);

  const ph = useCaptureStore((s) => s.finalPh);
  const confidence = useCaptureStore((s) => s.confidence);
  const pads = useCaptureStore((s) => s.finalPads);
  const sample = useCaptureStore((s) => s.sample);
  const resetSession = useCaptureStore((s) => s.resetSession);

  const cls = classify(ph, uc);
  const rec = recommendation(ph, uc);
  const color = phToColor(ph);
  const delta = ph - uc.ideal;

  // Referência do modelo no pH casado (para comparar com os campos lidos).
  const refPads = useMemo(() => {
    let best = model.reference[0];
    let bd = Infinity;
    for (const r of model.reference) {
      const d = Math.abs(r.ph - ph);
      if (d < bd) {
        bd = d;
        best = r;
      }
    }
    return best?.pads ?? [];
  }, [model, ph]);

  const [saving, setSaving] = useState(false);
  const wave = useSharedValue(0);
  useEffect(() => {
    wave.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [wave]);
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - wave.value) * 10 - 4 }] }));

  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const onRetake = () => {
    resetSession(sample);
    router.replace("/capture");
  };

  const onSave = async () => {
    if (saving || !pads.length) {
      if (!pads.length) router.replace("/");
      return;
    }
    setSaving(true);
    try {
      await saveReading({ sampleId: sample.id, ph, confidence, photos: pads, stripModelId: model.id, pads });
      bumpData();
      router.replace("/");
    } catch {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Pressable onPress={onRetake} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: PALETTE.surface, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevL" size={18} />
          </Pressable>
          <Text style={{ fontSize: 12, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Resultado da leitura</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Hero */}
        <GlassCard primary={primary} padding={24} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon name={toIconName(sample.icon)} size={13} color={PALETTE.ink} strokeWidth={1.8} />
            <Text style={{ fontSize: 11, color: PALETTE.muted55, fontFamily: FONTS.regular }}>{sample.name}</Text>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: 11, color: PALETTE.muted55, fontFamily: FONTS.regular }}>{now}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
            <View style={{ width: 92, height: 92, borderRadius: 24, backgroundColor: color, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 5 }}>
              <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: "50%", bottom: -20, backgroundColor: color, opacity: 0.45, borderTopLeftRadius: 40, borderTopRightRadius: 40 }, waveStyle]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: PALETTE.muted50, fontFamily: FONTS.regular, marginBottom: 2 }}>pH detectado</Text>
              <Text style={{ fontFamily: FONTS.light, fontSize: 72, lineHeight: 72, color: PALETTE.ink, letterSpacing: -2.8, fontVariant: ["tabular-nums"] }}>{fmtPh(ph)}</Text>
            </View>
          </View>

          <PhSpectrum value={ph} height={14} showScale animate />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.5)" }}>
            <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: cls.color }} />
            <Text style={{ flex: 1, fontSize: 12, color: PALETTE.ink, fontFamily: FONTS.medium }}>{cls.label}</Text>
            <Text style={{ fontSize: 11, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Confiança {Math.round(confidence * 100)}%</Text>
          </View>
        </GlassCard>

        {/* Comparativo */}
        <Card padding={16} style={{ marginBottom: 10 }}>
          <CardHeader icon="target" label="Comparativo com a faixa ideal" action={null} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Medido</Text>
              <BigStat value={fmtPh(ph)} unit="" size={28} />
            </View>
            <View style={{ width: 1, height: 36, backgroundColor: "rgba(0,0,0,0.1)" }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Ideal</Text>
              <BigStat value={fmtPh(uc.ideal)} unit="" size={28} />
            </View>
            <View style={{ width: 1, height: 36, backgroundColor: "rgba(0,0,0,0.1)" }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Δ</Text>
              <BigStat value={(delta >= 0 ? "+" : "") + fmtPh(delta)} unit="" size={28} color={Math.abs(delta) > 0.3 ? PALETTE.acid : PALETTE.trendUp} />
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <RangeBar low={uc.safeRange[0]} high={uc.safeRange[1]} value={ph} primary={primary} />
          </View>
        </Card>

        {/* Recomendação */}
        <Card padding={18} style={{ marginBottom: 10 }}>
          <CardHeader icon="sparkle" label="Recomendação" action={null} />
          <Text style={{ fontSize: 15, color: PALETTE.ink, fontFamily: FONTS.medium, marginBottom: 6 }}>{rec.title}</Text>
          <Text style={{ fontSize: 13, color: PALETTE.muted65, fontFamily: FONTS.regular, lineHeight: 20 }}>{rec.body}</Text>
        </Card>

        {/* Campos lidos vs referência */}
        <Card padding={16} style={{ marginBottom: 18 }}>
          <CardHeader icon="flask" label={`${pads.length} ${pads.length === 1 ? "campo lido" : "campos lidos"} · ${model.short}`} action={null} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ width: 64 }}>
              <Text style={{ fontSize: 9, color: PALETTE.muted50, fontFamily: FONTS.regular, marginBottom: 6 }}>Lido</Text>
              <Text style={{ fontSize: 9, color: PALETTE.muted50, fontFamily: FONTS.regular, marginTop: 40 }}>Referência</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {pads.map((c, i) => (
                  <View key={i} style={{ flex: 1, height: 34, borderRadius: 8, backgroundColor: c, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }} />
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {refPads.map((c, i) => (
                  <View key={i} style={{ flex: 1, height: 34, borderRadius: 8, backgroundColor: c, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", opacity: 0.85 }} />
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Ações */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={onRetake} style={{ flex: 1, height: 54, borderRadius: 18, backgroundColor: PALETTE.surface, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.1)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="camera" size={16} />
            <Text style={{ fontSize: 14, color: PALETTE.ink, fontFamily: FONTS.medium }}>Refazer</Text>
          </Pressable>

          <Pressable
            onPress={() => void onSave()}
            disabled={saving}
            style={{ flex: 2, height: 54, borderRadius: 18, opacity: saving ? 0.7 : 1, backgroundColor: PALETTE.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={{ fontSize: 14, color: "#fff", fontFamily: FONTS.medium }}>Salvar leitura</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
