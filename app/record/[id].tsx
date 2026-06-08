import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, toIconName } from "../../components/ui/Icon";
import { GlassCard } from "../../components/ui/GlassCard";
import { Card } from "../../components/ui/Card";
import { CardHeader } from "../../components/ui/CardHeader";
import { PhSpectrum } from "../../components/ui/PhSpectrum";
import { WaterWaves } from "../../components/ui/WaterWaves";

import { USE_CASES, classify, recommendation, phToColor } from "../../lib/ph/spectrum";
import { PALETTE, FONTS, fmtPh } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getReadingWithSample, type ReadingDetail } from "../../lib/db/queries";

// Parse defensivo de photosJson: nunca lança no render e garante string[].
function parsePhotos(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function RecordDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const primary = useAdaptiveColor();

  const [detail, setDetail] = useState<ReadingDetail | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    void getReadingWithSample(id).then((d) => setDetail(d));
  }, [id]);

  // Estado de carregamento
  if (detail === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: PALETTE.bg, paddingTop: insets.top + 14, paddingHorizontal: 18 }}>
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
      </View>
    );
  }

  // Estado vazio / registro não encontrado
  if (detail === null) {
    return (
      <View style={{ flex: 1, backgroundColor: PALETTE.bg, paddingTop: insets.top + 14, paddingHorizontal: 18 }}>
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="droplet" size={32} color={PALETTE.muted40} />
          <Text style={{ fontFamily: FONTS.regular, fontSize: 15, color: PALETTE.muted50 }}>Registro não encontrado</Text>
        </View>
      </View>
    );
  }

  const uc = USE_CASES[useCaseId];
  const record = detail.reading;
  const sampleData = detail.sample;

  // Fallback para quando o sample foi deletado
  const sample = sampleData ?? uc.samples[0];
  const sampleIcon = toIconName(sampleData?.icon ?? sample.icon);
  const sampleName = sampleData?.name ?? sample.name;

  const photos = parsePhotos(record.photosJson);
  const cls = classify(record.ph, uc);
  const rec = recommendation(record.ph, uc);
  const phColor = phToColor(record.ph);

  const dateStr = new Date(record.ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          {/* Botão voltar */}
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

          {/* Título */}
          <Text style={{ fontFamily: FONTS.regular, fontSize: 12, color: PALETTE.muted55 }}>
            Registro
          </Text>

          {/* Botão compartilhar */}
          <Pressable
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
            <Icon name="arrowUR" size={16} />
          </Pressable>
        </View>

        {/* GlassCard hero */}
        <GlassCard primary={primary} style={{ marginBottom: 14 }} padding={22}>
          {/* Linha: ícone + nome da amostra */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Icon name={sampleIcon} size={13} color={PALETTE.ink} strokeWidth={1.8} />
            <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: PALETTE.muted55 }}>
              {sampleName}
            </Text>
          </View>

          {/* pH gigante */}
          <Text
            style={{
              fontFamily: FONTS.light,
              fontSize: 84,
              lineHeight: 88,
              letterSpacing: -2.5,
              color: PALETTE.ink,
              fontVariant: ["tabular-nums"],
              marginBottom: 8,
            }}
          >
            {fmtPh(record.ph)}
          </Text>

          {/* Status + data/hora */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {/* Dot de status */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: cls.color,
              }}
            />
            <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: PALETTE.ink }}>
              {cls.label}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: PALETTE.muted55 }}>
              {dateStr}
            </Text>
          </View>

          {/* Espectro de pH */}
          <PhSpectrum value={record.ph} height={12} showScale />
        </GlassCard>

        {/* Card: Fotos capturadas */}
        <Card padding={16} style={{ marginBottom: 10 }}>
          <CardHeader icon="camera" label="Fotos capturadas" action={null} />

          {/* Swatches de cor das fotos */}
          {photos.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {photos.map((color, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 64,
                    borderRadius: 10,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                />
              ))}
            </View>
          ) : (
            /* Placeholder se não houver fotos — mostra a cor do pH */
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                style={{
                  flex: 1,
                  height: 64,
                  borderRadius: 10,
                  backgroundColor: phColor,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                }}
              />
            </View>
          )}

          {/* Confiança */}
          <Text
            style={{
              marginTop: 12,
              fontFamily: FONTS.regular,
              fontSize: 11,
              color: PALETTE.muted55,
            }}
          >
            {`Confiança · ${Math.round((record.confidence ?? 0.9) * 100)}%`}
          </Text>
        </Card>

        {/* Card: Próxima ação sugerida */}
        <Card padding={18} style={{ marginBottom: 10 }}>
          <CardHeader icon="sparkle" label="Próxima ação sugerida" action={null} />
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: 15,
              color: PALETTE.ink,
              marginBottom: 6,
            }}
          >
            {rec.title}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: 13,
              color: PALETTE.muted65,
              lineHeight: 20,
            }}
          >
            {rec.body}
          </Text>
        </Card>
      </ScrollView>

      {/* Ondas ambientes atrás da nav */}
      <WaterWaves color={phColor} height={180} opacity={1} />
    </View>
  );
}
