import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator, useWindowDimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

import { Icon, toIconName } from "../../components/ui/Icon";
import { PALETTE, FONTS } from "../../lib/theme/tokens";
import { useAdaptiveColor } from "../../lib/theme/useAdaptiveColor";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureStore, type CaptureSample } from "../../store/captureStore";
import { getSamples } from "../../lib/db/queries";
import type { Sample } from "../../lib/db/schema";
import { getStripModel } from "../../lib/strips/catalog";
import { STRIP_GEO } from "../../lib/strips/geometry";

const SCAN_GREEN = "#76FB91";

export default function CaptureViewfinder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const primary = useAdaptiveColor();

  const useCaseId = useAppStore((s) => s.useCaseId);
  const stripModelId = useAppStore((s) => s.stripModelId);
  const model = getStripModel(stripModelId);
  const padCount = model.padCount;

  const sample = useCaptureStore((s) => s.sample);
  const flashOn = useCaptureStore((s) => s.flashOn);
  const resetSession = useCaptureStore((s) => s.resetSession);
  const setSample = useCaptureStore((s) => s.setSample);
  const setFlash = useCaptureStore((s) => s.setFlash);
  const setPhoto = useCaptureStore((s) => s.setPhoto);

  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const mountedRef = useRef(true);
  const didInitRef = useRef(false);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getSamples(useCaseId).then((ss) => {
        if (!alive) return;
        setSamples(ss);
        if (!ss.length) return;
        const current = ss.find((x) => x.id === sample.id);
        if (!didInitRef.current) {
          didInitRef.current = true;
          resetSession(toCaptureSample(current ?? ss[0]));
        } else if (!current) {
          setSample(toCaptureSample(ss[0]));
        }
      });
      return () => {
        alive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useCaseId])
  );

  const cycleSample = useCallback(() => {
    if (!samples || samples.length < 2) return;
    const idx = samples.findIndex((s) => s.id === sample.id);
    const nextS = samples[(idx + 1) % samples.length];
    setSample(toCaptureSample(nextS));
  }, [samples, sample.id, setSample]);

  const onShoot = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (!shot?.uri) throw new Error("Falha ao capturar a foto.");
      if (mountedRef.current) {
        setPhoto({ uri: shot.uri, w: shot.width ?? 0, h: shot.height ?? 0 });
        router.push("/capture/align");
      }
    } catch (e) {
      if (mountedRef.current) Alert.alert("Erro na captura", e instanceof Error ? e.message : "Tente novamente.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [busy, setPhoto, router]);

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: PALETTE.ink, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 18 }}>
        <CloseButton insets={insets} onPress={() => router.back()} />
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
          <Icon name="camera" size={28} color="#fff" />
        </View>
        <Text style={{ color: "#fff", fontSize: 18, fontFamily: FONTS.medium }}>Acesso à câmera</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: FONTS.regular, textAlign: "center", lineHeight: 20 }}>
          Precisamos da câmera para fotografar a tira e ler o pH pela cor.
        </Text>
        <Pressable onPress={() => void requestPermission()} style={{ marginTop: 6, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18, backgroundColor: primary }}>
          <Text style={{ color: PALETTE.ink, fontSize: 14, fontFamily: FONTS.medium }}>Permitir câmera</Text>
        </Pressable>
      </View>
    );
  }

  if (samples && samples.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: PALETTE.ink, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 }}>
        <CloseButton insets={insets} onPress={() => router.back()} />
        <Icon name="droplet" size={34} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 17, fontFamily: FONTS.medium, textAlign: "center" }}>Crie um local primeiro</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: FONTS.regular, textAlign: "center", lineHeight: 20 }}>
          Cadastre a piscina ou aquário que você vai medir.
        </Text>
        <Pressable onPress={() => router.push("/sample/new")} style={{ marginTop: 6, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18, backgroundColor: primary }}>
          <Text style={{ color: PALETTE.ink, fontSize: 14, fontFamily: FONTS.medium }}>Criar local</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.ink, overflow: "hidden" }}>
      <CameraView ref={cameraRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} facing="back" enableTorch={flashOn} />

      <StripGuide padCount={padCount} sw={SW} sh={SH} />

      {/* Topbar */}
      <View style={{ position: "absolute", top: insets.top + 12, left: 16, right: 16, zIndex: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} style={glassBtn}>
          <Icon name="x" size={18} color="#fff" />
        </Pressable>
        <Pressable onPress={cycleSample} style={{ flexDirection: "row", alignItems: "center", gap: 6, maxWidth: 220, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Icon name={toIconName(sample.icon)} size={14} color="#fff" strokeWidth={1.8} />
          <Text numberOfLines={1} style={{ color: "#fff", fontSize: 12, fontFamily: FONTS.medium }}>{sample.name || "Local"}</Text>
        </Pressable>
        <Pressable onPress={() => setFlash(!flashOn)} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: flashOn ? primary : "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
          <Icon name={flashOn ? "flash" : "flashOff"} size={16} color={flashOn ? PALETTE.ink : "#fff"} />
        </Pressable>
      </View>

      {/* Instrução */}
      <View style={{ position: "absolute", top: insets.top + 66, left: 0, right: 0, zIndex: 10, alignItems: "center" }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.5)", maxWidth: SW - 48 }}>
          <Text style={{ color: "#fff", fontSize: 12, fontFamily: FONTS.medium, textAlign: "center" }}>
            Aproxime a tira das miras e fotografe
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontFamily: FONTS.regular, textAlign: "center", marginTop: 2 }}>
            Você vai ajustar o alinhamento na próxima tela · {model.short}
          </Text>
        </View>
      </View>

      {/* Shutter */}
      <View style={{ position: "absolute", bottom: insets.bottom + 28, left: 0, right: 0, zIndex: 10, alignItems: "center" }}>
        <Pressable onPress={() => void onShoot()} disabled={busy} style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: "#fff", padding: 4, alignItems: "center", justifyContent: "center", opacity: busy ? 0.7 : 1, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
          <View style={{ width: "100%", height: "100%", borderRadius: 999, backgroundColor: primary, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            {busy ? <ActivityIndicator size="small" color={PALETTE.ink} /> : <Icon name="camera" size={24} color={PALETTE.ink} />}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function toCaptureSample(s: Sample): CaptureSample {
  return { id: s.id, name: s.name, icon: s.icon };
}

const glassBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
  justifyContent: "center",
} as const;

function CloseButton({ insets, onPress }: { insets: { top: number }; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ position: "absolute", top: insets.top + 12, left: 16, ...glassBtn }}>
      <Icon name="x" size={18} color="#fff" />
    </Pressable>
  );
}

// Miras de orientação (apenas guia visual; o alinhamento fino é na próxima tela).
function StripGuide({ padCount, sw, sh }: { padCount: number; sw: number; sh: number }) {
  const g = STRIP_GEO;
  const frameX = (g.centerX - g.width / 2) * sw;
  const frameW = g.width * sw;
  const topPx = g.top * sh;
  const bottomPx = g.bottom * sh;
  const segH = (bottomPx - topPx) / padCount;

  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [scan]);
  const scanStyle = useAnimatedStyle(() => ({ top: topPx + scan.value * (bottomPx - topPx - 2) }));

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3 }}>
      {Array.from({ length: padCount }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: frameX,
            width: frameW,
            top: topPx + i * segH + 3,
            height: segH - 6,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.7)",
          }}
        />
      ))}
      <Animated.View style={[{ position: "absolute", left: frameX - 4, width: frameW + 8, height: 2, backgroundColor: SCAN_GREEN, borderRadius: 1, shadowColor: SCAN_GREEN, shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 6 }, scanStyle]} />
    </View>
  );
}
