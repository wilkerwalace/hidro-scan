import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { useRouter } from "expo-router";

import { GlassCard } from "./ui/GlassCard";
import { Icon } from "./ui/Icon";
import { PhSpectrum } from "./ui/PhSpectrum";
import { classify, type UseCase } from "../lib/ph/spectrum";
import { PALETTE, FONTS, fmtPh } from "../lib/theme/tokens";
import type { SampleLatest } from "../lib/db/queries";

const GAP = 12;
const SIDE = 18;

// Carrossel horizontal: um card por Local mostrando a última leitura dele.
export function HeroCarousel({ items, uc, primary }: { items: SampleLatest[]; uc: UseCase; primary: string }) {
  const router = useRouter();
  const { width: SW } = useWindowDimensions();
  const cardW = SW - SIDE * 2 - (items.length > 1 ? 36 : 0); // peek do próximo quando há mais de um
  const snap = cardW + GAP;
  const [page, setPage] = useState(0);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / snap));
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={onEnd}
        style={{ marginHorizontal: -SIDE }}
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {items.map(({ sample, latest }, i) => {
          const cls = latest ? classify(latest.ph, uc) : null;
          return (
            <View key={sample.id} style={{ width: cardW, marginRight: i === items.length - 1 ? 0 : GAP, marginBottom: 14 }}>
              <Pressable onPress={() => (latest ? router.push(`/record/${latest.id}`) : router.push("/samples"))}>
              <GlassCard primary={primary} style={{ height: 170 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
                  <Icon name="bolt" size={14} color={PALETTE.ink} />
                  <Text style={{ fontSize: 12, color: "rgba(10,10,10,0.7)", fontFamily: FONTS.regular }}>Última leitura</Text>
                  <View style={{ flex: 1 }} />
                  <Text numberOfLines={1} style={{ fontSize: 11, color: PALETTE.muted55, fontFamily: FONTS.medium, maxWidth: cardW * 0.5 }}>
                    {sample.name}
                  </Text>
                </View>

                {latest && cls ? (
                  <>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
                      <View>
                        <Text style={{ fontFamily: FONTS.light, fontSize: 56, lineHeight: 56, color: PALETTE.ink, letterSpacing: -1.6, fontVariant: ["tabular-nums"] }}>
                          {fmtPh(latest.ph)}
                        </Text>
                        <Text style={{ fontSize: 11, color: PALETTE.muted55, marginTop: 4, fontFamily: FONTS.regular }}>pH</Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: PALETTE.ink }}>
                        <View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: cls.color }} />
                        <Text style={{ color: cls.color, fontSize: 11, fontFamily: FONTS.medium }}>{cls.label}</Text>
                      </View>
                    </View>
                    <View style={{ marginTop: 16 }}>
                      <PhSpectrum value={latest.ph} height={10} showScale={false} animate />
                    </View>
                  </>
                ) : (
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONTS.light, fontSize: 40, color: PALETTE.muted40 }}>—</Text>
                    <Text style={{ fontSize: 12, color: PALETTE.muted55, marginTop: 4, fontFamily: FONTS.regular }}>Sem leituras ainda</Text>
                  </View>
                )}
              </GlassCard>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Indicadores */}
      {items.length > 1 && (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === page ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === page ? PALETTE.ink : "rgba(10,10,10,0.2)",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default HeroCarousel;
