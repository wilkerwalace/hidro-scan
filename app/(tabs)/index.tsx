import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "../../components/ui/Logo";
import { Icon, toIconName, type IconName } from "../../components/ui/Icon";
import { GlassCard } from "../../components/ui/GlassCard";
import { HeroCarousel } from "../../components/HeroCarousel";
import { Pill } from "../../components/ui/Pill";
import { Card } from "../../components/ui/Card";
import { CardHeader } from "../../components/ui/CardHeader";
import { BigStat } from "../../components/ui/BigStat";
import { MiniBar } from "../../components/ui/MiniBar";
import { Sparkline } from "../../components/ui/Sparkline";
import { WaterWaves } from "../../components/ui/WaterWaves";

import { USE_CASES, classify, phToColor } from "../../lib/ph/spectrum";
import { PALETTE, FONTS, fmtPh, formatRelative, initials } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getOverview, getRecentReadings, type Overview } from "../../lib/db/queries";
import type { Reading } from "../../lib/db/schema";

const fmtPct = (n: number) => n.toFixed(1).replace(".", ",");
const WEEK_GOAL = 7; // meta semanal de leituras (referência da barra)

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const name = useAppStore((s) => s.name);
  const uc = USE_CASES[useCaseId];
  const primary = useAdaptiveColor();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<Reading[]>([]);

  const load = useCallback(async () => {
    const [ov, rc] = await Promise.all([getOverview(useCaseId), getRecentReadings(useCaseId, 4)]);
    setOverview(ov);
    setRecent(rc);
  }, [useCaseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load, dataVersion])
  );

  // Mapa id -> meta da amostra (somente do DB).
  const sampleMeta = new Map<string, { name: string; icon: IconName }>();
  (overview?.samplesLatest ?? []).forEach((x) =>
    sampleMeta.set(x.sample.id, { name: x.sample.name, icon: toIconName(x.sample.icon) })
  );

  const count = overview?.samplesLatest.length ?? 0;
  const total = overview?.total ?? 0;
  const weekTotal = overview?.weekTotal ?? 0;
  const percentInRange = overview?.percentInRange ?? 0;
  const avgPh = overview?.avgPh ?? uc.ideal;
  const avgColor = phToColor(avgPh);

  const chips = (overview?.samplesLatest ?? []).map((x) => ({
    id: x.sample.id,
    name: x.sample.name,
    icon: toIconName(x.sample.icon),
    ph: x.latest?.ph ?? null,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 150 }}
      >
        {/* Topbar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Logo size={36} primary={primary} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => router.navigate("/reminders")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#fff",
                borderWidth: 0.5,
                borderColor: "rgba(0,0,0,0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="bell" size={16} />
            </Pressable>
            <Pressable
              onPress={() => router.navigate("/profile")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: PALETTE.track,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: PALETTE.ink }}>{initials(name)}</Text>
            </Pressable>
          </View>
        </View>

        {/* Eyebrow + título */}
        <Text style={{ color: PALETTE.muted50, fontSize: 11, marginBottom: 4, fontFamily: FONTS.regular }}>
          {count} {count === 1 ? "local" : "locais"} monitorando
        </Text>
        <Text style={{ fontFamily: FONTS.regular, fontSize: 38, color: PALETTE.ink, letterSpacing: -0.8, marginBottom: 22 }}>
          Visão Geral
        </Text>

        {count === 0 ? (
          /* Estado vazio: nenhum local ainda */
          <GlassCard primary={primary} padding={24}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <Icon name="droplet" size={30} color={PALETTE.ink} strokeWidth={1.6} />
              <Text style={{ fontFamily: FONTS.medium, fontSize: 16, color: PALETTE.ink }}>Comece criando um local</Text>
              <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: PALETTE.muted60, textAlign: "center", lineHeight: 19 }}>
                Cadastre sua piscina ou aquário para registrar as leituras de pH.
              </Text>
              <Pressable
                onPress={() => router.push("/sample/new")}
                style={{
                  marginTop: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 18,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: PALETTE.ink,
                }}
              >
                <Icon name="plus" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontFamily: FONTS.medium, fontSize: 14 }}>Criar local de amostra</Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : (
          <>
            {/* Hero — última leitura (carrossel por local) */}
            <HeroCarousel items={overview?.samplesLatest ?? []} uc={uc} primary={primary} />

            {/* Chips de amostras */}
            {chips.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 18 }}
                style={{ marginBottom: 14, marginHorizontal: -18, paddingHorizontal: 18 }}
              >
                {chips.map((c) => (
                  <Pill key={c.id} onPress={() => router.navigate("/samples")}>
                    <Icon name={c.icon} size={14} strokeWidth={1.8} />
                    <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: PALETTE.ink, marginLeft: 6 }}>
                      {c.name} · <Text style={{ fontVariant: ["tabular-nums"] }}>{c.ph == null ? "—" : c.ph.toFixed(2)}</Text>
                    </Text>
                  </Pill>
                ))}
              </ScrollView>
            )}

            {/* Stat cards */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <Card padding={16} style={{ flex: 1 }} onPress={() => router.navigate("/samples")}>
                <CardHeader icon="droplet" label="Total leituras" />
                <BigStat value={total} unit="" size={36} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Semana</Text>
                  <Text style={{ fontSize: 10, color: PALETTE.ink, fontFamily: FONTS.medium }}>{weekTotal}</Text>
                </View>
                <MiniBar value={Math.min(1, weekTotal / WEEK_GOAL)} primary={primary} animate />
              </Card>

              <Card padding={16} style={{ flex: 1 }} onPress={() => router.navigate("/samples")}>
                <CardHeader icon="target" label="Em faixa" />
                <BigStat value={fmtPct(percentInRange)} unit="%" size={36} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Meta</Text>
                  <Text style={{ fontSize: 10, color: PALETTE.ink, fontFamily: FONTS.medium }}>90%</Text>
                </View>
                <MiniBar value={percentInRange / 100} primary={primary} animate />
              </Card>
            </View>

            {/* Tendência */}
            <Card padding={16} style={{ marginBottom: 10 }} onPress={() => router.navigate("/samples")}>
              <CardHeader icon="trend" label="Tendência" />
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, marginBottom: 14 }}>
                <BigStat value={fmtPh(avgPh)} unit="" size={38} />
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 10, color: PALETTE.muted50, fontFamily: FONTS.regular }}>Média geral</Text>
              </View>
              {overview && overview.sparkline.length > 0 ? (
                <>
                  <Sparkline data={overview.sparkline} accent={primary} mode="bars" height={50} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ fontSize: 10, color: PALETTE.muted40, fontFamily: FONTS.regular }}>30d atrás</Text>
                    <Text style={{ fontSize: 10, color: PALETTE.muted40, fontFamily: FONTS.regular }}>Hoje</Text>
                  </View>
                </>
              ) : (
                <Text style={{ fontSize: 12, color: PALETTE.muted40, fontFamily: FONTS.regular, paddingVertical: 14 }}>
                  Sem dados de tendência ainda.
                </Text>
              )}
            </Card>

            {/* CTA captura */}
            <Pressable
              onPress={() => router.push("/capture")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderRadius: 22,
                backgroundColor: PALETTE.ink,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: primary, alignItems: "center", justifyContent: "center" }}>
                <Icon name="camera" size={18} color={PALETTE.ink} />
              </View>
              <View>
                <Text style={{ fontSize: 14, color: "#fff", fontFamily: FONTS.medium }}>Nova leitura</Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: FONTS.regular }}>Câmera · alinhe e leia</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Icon name="chevR" size={18} color="#fff" />
            </Pressable>

            {/* Histórico recente */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
              <Text style={{ fontFamily: FONTS.regular, fontSize: 20, color: PALETTE.ink, letterSpacing: -0.2 }}>Histórico recente</Text>
              <Pressable onPress={() => router.navigate("/samples")}>
                <Text style={{ fontSize: 12, color: PALETTE.muted55, fontFamily: FONTS.regular }}>Ver tudo</Text>
              </Pressable>
            </View>

            {recent.length === 0 ? (
              <Text style={{ fontSize: 13, color: PALETTE.muted50, fontFamily: FONTS.regular, paddingHorizontal: 4 }}>
                Nenhuma leitura ainda. Toque em "Nova leitura" para começar.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {recent.map((r) => {
                  const meta = sampleMeta.get(r.sampleId) ?? { name: "Amostra", icon: "droplet" as IconName };
                  const c = classify(r.ph, uc);
                  return (
                    <Card key={r.id} padding={14} onPress={() => router.push(`/record/${r.id}`)}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: phToColor(r.ph),
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Icon name={meta.icon} size={20} color={PALETTE.ink} strokeWidth={1.8} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ fontSize: 14, color: PALETTE.ink, fontFamily: FONTS.medium }}>
                            {meta.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: PALETTE.muted50, fontFamily: FONTS.regular }}>
                            {formatRelative(r.ts)} · {c.label}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: FONTS.regular, fontSize: 22, color: PALETTE.ink, letterSpacing: -0.4, fontVariant: ["tabular-nums"] }}>
                          {fmtPh(r.ph)}
                        </Text>
                        <Icon name="chevR" size={14} color="rgba(0,0,0,0.3)" />
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Ondas ambientes atrás da nav */}
      <WaterWaves color={avgColor} height={180} opacity={1} />
    </View>
  );
}
