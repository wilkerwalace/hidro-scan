import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from "@expo-google-fonts/outfit";

import { db, useMigrations, migrations } from "../lib/db/client";
import { loadSettings } from "../lib/db/settings";
import { useAppStore, type ColorMode } from "../store/useAppStore";
import { PALETTE, FONTS } from "../lib/theme/tokens";
import type { UseCaseId } from "../lib/ph/spectrum";

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const hydrate = useAppStore((s) => s.hydrate);
  const setReady = useAppStore((s) => s.setReady);
  const ready = useAppStore((s) => s.ready);
  const onboarded = useAppStore((s) => s.onboarded);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  useEffect(() => {
    if (!success) return;
    (async () => {
      const cfg = await loadSettings();
      hydrate({
        useCaseId: (cfg.useCase as UseCaseId) || "pool",
        colorMode: (cfg.colorMode as ColorMode) || "fixed",
        onboarded: cfg.onboarded === "1",
        name: cfg.name || "",
        email: cfg.email || "",
        stripModelId: cfg.stripModelId || "",
      });
      setReady(true);
    })();
  }, [success, hydrate, setReady]);

  // Gate de onboarding: primeira execução cai no fluxo de 3 passos.
  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboarded && !inOnboarding) router.replace("/onboarding");
    else if (onboarded && inOnboarding) router.replace("/");
  }, [ready, onboarded, segments, router]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.bg, paddingHorizontal: 24 }}>
        <Text style={{ color: PALETTE.acid, fontSize: 18, fontFamily: FONTS.semibold, marginBottom: 12 }}>
          Erro no banco de dados
        </Text>
        <Text style={{ color: PALETTE.muted60, textAlign: "center", fontSize: 13 }}>{error.message}</Text>
      </View>
    );
  }

  if (!success || !fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.bg }}>
        <ActivityIndicator size="large" color={PALETTE.ink} />
        <Text style={{ color: PALETTE.muted55, marginTop: 14, fontSize: 13, fontFamily: FONTS.regular }}>
          Iniciando…
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: PALETTE.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen
            name="capture"
            options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="record/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="strip-model" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="sample/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          <Stack.Screen name="reminder/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
