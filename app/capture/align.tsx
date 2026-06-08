import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image, type LayoutChangeEvent } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import type { SkImage } from "@shopify/react-native-skia";

import { Icon } from "../../components/ui/Icon";
import { PALETTE, FONTS, fmtPh } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { getStripModel } from "../../lib/strips/catalog";
import { STRIP_GEO } from "../../lib/strips/geometry";
import { decodeForSampling, readPadsRotated, confidenceFromDeltaE, type StripReading } from "../../lib/strips/analyzeStrip";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureStore } from "../../store/captureStore";

type Rect = { x: number; y: number; w: number; h: number };
const STEP = Math.PI / 36; // 5° por toque nos botões

export default function AlignScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();

  const stripModelId = useAppStore((s) => s.stripModelId);
  const model = getStripModel(stripModelId);
  const padCount = model.padCount;

  const photoUri = useCaptureStore((s) => s.photoUri);
  const setResult = useCaptureStore((s) => s.setResult);

  const [image, setImage] = useState<SkImage | null>(null);
  const [container, setContainer] = useState<{ w: number; h: number } | null>(null);
  const [reading, setReading] = useState<StripReading | null>(null);

  const imageRef = useRef<SkImage | null>(null);
  const fitRef = useRef<Rect | null>(null);

  const cx = useSharedValue(0);
  const cy = useSharedValue(0);
  const fw = useSharedValue(0);
  const fh = useSharedValue(0);
  const angle = useSharedValue(0);
  const savedW = useSharedValue(0);
  const savedH = useSharedValue(0);
  const savedA = useSharedValue(0);

  useEffect(() => {
    if (!photoUri) router.replace("/capture");
  }, [photoUri, router]);

  useEffect(() => {
    if (!photoUri) return;
    let alive = true;
    void decodeForSampling(photoUri)
      .then((img) => {
        if (!alive) return;
        imageRef.current = img;
        setImage(img);
      })
      .catch(() => router.replace("/capture"));
    return () => {
      alive = false;
    };
  }, [photoUri, router]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ w: width, h: height });
  };

  const doSample = useCallback(() => {
    const img = imageRef.current;
    const fit = fitRef.current;
    if (!img || !fit || fw.value <= 0) return;
    setReading(
      readPadsRotated(
        img,
        fit,
        { cx: cx.value, cy: cy.value, fw: fw.value, fh: fh.value, angle: angle.value },
        model
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  useEffect(() => {
    if (!container || !image) return;
    const { w: CW, h: CH } = container;
    const iw = image.width();
    const ih = image.height();
    const aspect = iw > 0 && ih > 0 ? iw / ih : 3 / 4;

    let dispH = Math.min(CH, CW / aspect);
    let dispW = dispH * aspect;
    if (dispW > CW) {
      dispW = CW;
      dispH = CW / aspect;
    }
    const fit: Rect = { x: (CW - dispW) / 2, y: (CH - dispH) / 2, w: dispW, h: dispH };
    fitRef.current = fit;

    fw.value = dispW * STRIP_GEO.width * 1.1;
    fh.value = dispH * (STRIP_GEO.bottom - STRIP_GEO.top);
    cx.value = fit.x + dispW / 2;
    cy.value = fit.y + dispH / 2;
    angle.value = 0;
    doSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, image]);

  const minW = 50;
  const pan = Gesture.Pan()
    .onChange((e) => {
      "worklet";
      cx.value += e.changeX;
      cy.value += e.changeY;
    })
    .onEnd(() => {
      "worklet";
      runOnJS(doSample)();
    });
  const pinch = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      savedW.value = fw.value;
      savedH.value = fh.value;
    })
    .onUpdate((e) => {
      "worklet";
      fw.value = Math.max(minW, savedW.value * e.scale);
      fh.value = Math.max(minW * 2, savedH.value * e.scale);
    })
    .onEnd(() => {
      "worklet";
      runOnJS(doSample)();
    });
  const rotation = Gesture.Rotation()
    .onStart(() => {
      "worklet";
      savedA.value = angle.value;
    })
    .onUpdate((e) => {
      "worklet";
      angle.value = savedA.value + e.rotation;
    })
    .onEnd(() => {
      "worklet";
      runOnJS(doSample)();
    });
  const composed = Gesture.Simultaneous(pan, pinch, rotation);

  const frameStyle = useAnimatedStyle(() => ({
    left: cx.value - fw.value / 2,
    top: cy.value - fh.value / 2,
    width: fw.value,
    height: fh.value,
    transform: [{ rotateZ: `${angle.value}rad` }],
  }));

  const rotateBy = (d: number) => {
    angle.value += d;
    doSample();
  };

  const onAnalyze = () => {
    if (!reading) return;
    setResult({ ph: reading.ph, confidence: confidenceFromDeltaE(reading.deltaE), pads: reading.pads });
    router.replace("/capture/result");
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.ink }}>
      {/* Header */}
      <View style={{ position: "absolute", top: insets.top + 12, left: 16, right: 16, zIndex: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.replace("/capture")} style={glassBtn}>
          <Icon name="chevL" size={18} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontSize: 13, fontFamily: FONTS.medium }}>Alinhe os campos</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Imagem + molde */}
      <GestureDetector gesture={composed}>
        <View style={{ flex: 1 }} onLayout={onContainerLayout}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} resizeMode="contain" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          ) : null}

          <Animated.View pointerEvents="none" style={[{ position: "absolute", borderWidth: 2, borderColor: primary, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.06)" }, frameStyle]}>
            {Array.from({ length: padCount }).map((_, i) => (
              <View key={i} style={{ flex: 1, borderTopWidth: i === 0 ? 0 : 1, borderColor: "rgba(255,255,255,0.7)" }} />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Painel inferior */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 14, paddingHorizontal: 18, paddingBottom: insets.bottom + 16, backgroundColor: "rgba(10,10,10,0.82)", borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: FONTS.regular, textAlign: "center", marginBottom: 12 }}>
          Arraste para mover · pinça para redimensionar · 2 dedos para girar
        </Text>

        {/* Girar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
          <Pressable onPress={() => rotateBy(-STEP)} style={rotBtn}>
            <Text style={{ color: "#fff", fontSize: 20, marginTop: -2 }}>⟲</Text>
          </Pressable>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: FONTS.regular }}>Girar</Text>
          <Pressable onPress={() => rotateBy(STEP)} style={rotBtn}>
            <Text style={{ color: "#fff", fontSize: 20, marginTop: -2 }}>⟳</Text>
          </Pressable>
        </View>

        {/* Prévia */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 5, flex: 1 }}>
            {(reading?.pads ?? new Array(padCount).fill("#333")).map((c, i) => (
              <View key={i} style={{ flex: 1, height: 38, borderRadius: 8, backgroundColor: c, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }} />
            ))}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: FONTS.regular }}>pH estimado</Text>
            <Text style={{ color: "#fff", fontFamily: FONTS.light, fontSize: 34, lineHeight: 36, fontVariant: ["tabular-nums"] }}>
              {reading ? fmtPh(reading.ph) : "—"}
            </Text>
          </View>
        </View>

        {/* Ações */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={() => router.replace("/capture")} style={{ flex: 1, height: 52, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
            <Icon name="camera" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontFamily: FONTS.medium }}>Refazer foto</Text>
          </Pressable>
          <Pressable onPress={onAnalyze} disabled={!reading} style={{ flex: 2, height: 52, borderRadius: 16, backgroundColor: primary, opacity: reading ? 1 : 0.5, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
            <Icon name="check" size={16} color={PALETTE.ink} />
            <Text style={{ color: PALETTE.ink, fontSize: 14, fontFamily: FONTS.medium }}>Analisar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const glassBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
  justifyContent: "center",
} as const;

const rotBtn = {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: "rgba(255,255,255,0.14)",
  alignItems: "center",
  justifyContent: "center",
} as const;
