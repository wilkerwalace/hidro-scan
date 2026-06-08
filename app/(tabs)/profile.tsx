import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "../../components/ui/Icon";
import { GlassCard } from "../../components/ui/GlassCard";
import { Card } from "../../components/ui/Card";
import { CardHeader } from "../../components/ui/CardHeader";
import { BigStat } from "../../components/ui/BigStat";
import { WaterWaves } from "../../components/ui/WaterWaves";

import { USE_CASES } from "../../lib/ph/spectrum";
import { PALETTE, FONTS, initials } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getProfileStats, clearAllData, type ProfileStats } from "../../lib/db/queries";
import { getStripModel } from "../../lib/strips/catalog";

// ──────────────────────────────────────────────────────────────
// Dados da lista de configuracoes
// ──────────────────────────────────────────────────────────────
type SettingRow = {
  icon: IconName;
  label: string;
  sub: string;
  onPress?: () => void;
};

// ──────────────────────────────────────────────────────────────
// Tela principal
// ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();

  const router = useRouter();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const setUseCaseId = useAppStore((s) => s.setUseCaseId);
  const name = useAppStore((s) => s.name);
  const email = useAppStore((s) => s.email);
  const stripModelId = useAppStore((s) => s.stripModelId);
  const resetAll = useAppStore((s) => s.resetAll);

  const uc = USE_CASES[useCaseId];
  const stripModel = getStripModel(stripModelId);
  const displayName = name.trim() || "Você";
  const displayEmail = email.trim() || "100% local, sem conta";

  const settings: SettingRow[] = [
    { icon: "flask", label: "Marca da tira de teste", sub: stripModel.name, onPress: () => router.push("/strip-model") },
    { icon: "target", label: "Calibração da câmera", sub: "Em breve" },
    { icon: "bell", label: "Notificações", sub: "Alertas e lembretes" },
    { icon: "history", label: "Exportar histórico", sub: "CSV · PDF · gerados no aparelho" },
    { icon: "shield", label: "Privacidade dos dados", sub: "Tudo armazenado localmente" },
    { icon: "info", label: "Sobre o Hidro Scan", sub: "v 1.0.0 · Gratuito e sem conta" },
  ];

  const onClearData = () => {
    Alert.alert(
      "Limpar todos os dados",
      "Isso apaga todos os locais, leituras e lembretes, e reinicia o app no início. Não dá para desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar tudo",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            resetAll();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const [stats, setStats] = useState<ProfileStats>({
    totalReadings: 0,
    samplesCount: 0,
    streak: 0,
  });

  const load = useCallback(async () => {
    const s = await getProfileStats(useCaseId);
    setStats(s);
  }, [useCaseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load, dataVersion])
  );

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 18,
          paddingBottom: 150,
        }}
      >
        {/* Titulo */}
        <Text
          style={{
            fontFamily: FONTS.regular,
            fontSize: 32,
            color: PALETTE.ink,
            letterSpacing: -0.6,
            marginBottom: 22,
          }}
        >
          Perfil
        </Text>

        {/* Card de usuario */}
        <GlassCard primary={primary} style={{ marginBottom: 14 }}>
          {/* Avatar + info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                backgroundColor: PALETTE.ink,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.regular,
                  fontSize: 22,
                  color: "#fff",
                }}
              >
                {initials(name)}
              </Text>
            </View>

            {/* Nome, email e badge */}
            <View>
              <Text style={{ fontFamily: FONTS.medium, fontSize: 18, color: PALETTE.ink }}>
                {displayName}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.regular,
                  fontSize: 12,
                  color: PALETTE.muted50,
                  marginTop: 1,
                }}
              >
                {displayEmail}
              </Text>

              {/* Badge offline */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: "rgba(10,10,10,0.06)",
                }}
              >
                <Icon name="shield" size={10} color="rgba(10,10,10,0.7)" strokeWidth={1.8} />
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 10,
                    color: "rgba(10,10,10,0.7)",
                  }}
                >
                  100% offline
                </Text>
              </View>
            </View>
          </View>

          {/* Linha de 3 stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            {/* Leituras */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <BigStat value={stats.totalReadings} unit="" size={24} />
              <Text
                style={{
                  fontSize: 10,
                  color: PALETTE.muted50,
                  fontFamily: FONTS.regular,
                  marginTop: 2,
                }}
              >
                Leituras
              </Text>
            </View>

            {/* Amostras */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <BigStat value={stats.samplesCount} unit="" size={24} />
              <Text
                style={{
                  fontSize: 10,
                  color: PALETTE.muted50,
                  fontFamily: FONTS.regular,
                  marginTop: 2,
                }}
              >
                Amostras
              </Text>
            </View>

            {/* Sequencia */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <BigStat value={`${stats.streak}d`} unit="" size={24} />
              <Text
                style={{
                  fontSize: 10,
                  color: PALETTE.muted50,
                  fontFamily: FONTS.regular,
                  marginTop: 2,
                }}
              >
                Sequência
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Card modo de uso */}
        <Card padding={16} style={{ marginBottom: 10 }}>
          <CardHeader icon="droplet" label="Modo de uso" action={null} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Object.values(USE_CASES).map((u) => {
              const isActive = useCaseId === u.id;
              return (
                <Pressable
                  key={u.id}
                  onPress={() => setUseCaseId(u.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 14,
                    backgroundColor: isActive ? PALETTE.ink : "#F4F4F4",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon
                    name={u.samples[0].icon as IconName}
                    size={22}
                    color={isActive ? "#fff" : PALETTE.ink}
                    strokeWidth={1.8}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 12,
                      color: isActive ? "#fff" : PALETTE.ink,
                    }}
                  >
                    {u.short}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 10,
                      color: isActive ? "rgba(255,255,255,0.6)" : PALETTE.muted50,
                    }}
                  >
                    {u.safeRange[0]}–{u.safeRange[1]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Lista de settings */}
        <Card padding={0} style={{ marginBottom: 10 }}>
          {settings.map((row, i) => (
            <Pressable
              key={i}
              onPress={row.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderBottomWidth: i < settings.length - 1 ? 0.5 : 0,
                borderBottomColor: PALETTE.hairline,
              }}
            >
              {/* Icone em quadrado */}
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "#F4F4F4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={row.icon} size={15} color={PALETTE.ink} strokeWidth={1.8} />
              </View>

              {/* Label + sub */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: PALETTE.ink }}>
                  {row.label}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.regular,
                    fontSize: 11,
                    color: PALETTE.muted50,
                    marginTop: 1,
                  }}
                >
                  {row.sub}
                </Text>
              </View>

              <Icon name="chevR" size={14} color="rgba(0,0,0,0.3)" />
            </Pressable>
          ))}
        </Card>

        {/* Limpar todos os dados */}
        <Pressable
          onPress={onClearData}
          android_ripple={{ color: "rgba(224,51,29,0.08)" }}
          style={{
            height: 50,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderWidth: 1,
            borderColor: "rgba(224,51,29,0.3)",
            backgroundColor: PALETTE.surface,
          }}
        >
          <Icon name="x" size={15} color={PALETTE.acid} />
          <Text style={{ color: PALETTE.acid, fontFamily: FONTS.medium, fontSize: 14 }}>Limpar todos os dados</Text>
        </Pressable>
      </ScrollView>

      {/* Ondas no rodape */}
      <WaterWaves color={primary} height={180} opacity={1} />
    </View>
  );
}
