import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, toIconName, type IconName } from "../../components/ui/Icon";
import { Card } from "../../components/ui/Card";
import { BigStat } from "../../components/ui/BigStat";
import { Sparkline } from "../../components/ui/Sparkline";
import { WaterWaves } from "../../components/ui/WaterWaves";

import { USE_CASES, classify, phToColor } from "../../lib/ph/spectrum";
import { PALETTE, FONTS, fmtPh } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { getSampleCards, type SampleCard } from "../../lib/db/queries";

export default function SamplesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const useCaseId = useAppStore((s) => s.useCaseId);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const uc = USE_CASES[useCaseId];
  const primary = useAdaptiveColor();

  const [cards, setCards] = useState<SampleCard[]>([]);

  const load = useCallback(async () => {
    const data = await getSampleCards(useCaseId);
    setCards(data);
  }, [useCaseId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load, dataVersion])
  );

  // Compute average pH for WaterWaves color
  const avgPhColor = cards.length
    ? phToColor(cards.reduce((sum, c) => sum + c.last, 0) / cards.length)
    : phToColor(uc.ideal);

  const screenTitle = uc.name === "Piscina & Spa" ? "Piscinas" : "Aquários";

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
          <View>
            <Text
              style={{
                fontSize: 11,
                color: PALETTE.muted50,
                fontFamily: FONTS.regular,
              }}
            >
              Minhas amostras
            </Text>
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 32,
                color: PALETTE.ink,
                letterSpacing: -0.6,
                marginTop: 2,
                lineHeight: 32,
              }}
            >
              {screenTitle}
            </Text>
          </View>

          {/* Add button */}
          <Pressable
            onPress={() => router.push("/sample/new")}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: PALETTE.ink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="plus" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Sample cards */}
        {cards.length === 0 ? (
          <Card padding={22}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <Icon name="droplet" size={28} color={PALETTE.muted40} strokeWidth={1.6} />
              <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: PALETTE.ink }}>Nenhum local ainda</Text>
              <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: PALETTE.muted60, textAlign: "center" }}>
                Toque no + acima para criar sua piscina ou aquário.
              </Text>
            </View>
          </Card>
        ) : (
        <View style={{ gap: 12 }}>
          {cards.map((card) => {
            const cls = classify(card.last, uc);
            const trendColor = card.trend >= 0 ? PALETTE.trendUp : PALETTE.trendDown;
            const trendIcon: IconName = card.trend >= 0 ? "arrowUp" : "arrowDown";

            return (
              <Card
                key={card.sample.id}
                padding={18}
                onPress={() => router.push("/capture")}
              >
                {/* Top row: icon + name/sub + pH value */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {/* Icon square */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: phToColor(card.last),
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                    }}
                  >
                    <Icon
                      name={toIconName(card.sample.icon)}
                      size={22}
                      color={PALETTE.ink}
                      strokeWidth={1.8}
                    />
                  </View>

                  {/* Name + sub */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 15,
                        fontFamily: FONTS.medium,
                        color: PALETTE.ink,
                      }}
                    >
                      {card.sample.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 11,
                        color: PALETTE.muted50,
                        fontFamily: FONTS.regular,
                        marginTop: 2,
                      }}
                    >
                      {card.sample.sub}
                    </Text>
                  </View>

                  {/* pH value + classification label */}
                  <View style={{ alignItems: "flex-end" }}>
                    <BigStat value={fmtPh(card.last)} unit="" size={26} />
                    <Text
                      style={{
                        fontSize: 10,
                        color: cls.color,
                        fontFamily: FONTS.medium,
                        marginTop: 2,
                      }}
                    >
                      {cls.label}
                    </Text>
                  </View>
                </View>

                {/* Sparkline */}
                <Sparkline
                  data={card.sparkline}
                  accent={primary}
                  mode="bars"
                  height={36}
                />

                {/* Footer: 30 days · count + trend */}
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: PALETTE.muted50,
                      fontFamily: FONTS.regular,
                    }}
                  >
                    30 dias · {card.count} leituras
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon
                      name={trendIcon}
                      size={10}
                      color={trendColor}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        color: trendColor,
                        fontFamily: FONTS.medium,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {Math.abs(card.trend).toFixed(2)} pH
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
        )}
      </ScrollView>

      {/* Ambient waves behind nav */}
      <WaterWaves color={avgPhColor} height={180} opacity={1} />
    </View>
  );
}
