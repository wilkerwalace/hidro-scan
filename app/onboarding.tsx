import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "../components/ui/Logo";
import { Icon, type IconName } from "../components/ui/Icon";
import { StripModelList } from "../components/StripModelList";
import { USE_CASES, phToColor, type UseCaseId } from "../lib/ph/spectrum";
import { DEFAULT_STRIP_ID } from "../lib/strips/catalog";
import { PALETTE, FONTS, SHADOWS } from "../lib/theme/tokens";
import { useAdaptiveColor } from "../lib/theme/useAdaptiveColor";
import { useAppStore } from "../store/useAppStore";
import { createSample } from "../lib/db/queries";

type Step = "intro" | "identity" | "mode" | "strip" | "location";
const STEPS: Step[] = ["intro", "identity", "mode", "strip", "location"];

const ICONS_BY_CASE: Record<UseCaseId, IconName[]> = {
  pool: ["pool", "spa", "wading", "droplet"],
  aquarium: ["plant", "fish", "betta", "droplet"],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primary = useAdaptiveColor();

  const setName = useAppStore((s) => s.setName);
  const setEmail = useAppStore((s) => s.setEmail);
  const setUseCaseId = useAppStore((s) => s.setUseCaseId);
  const setStripModelId = useAppStore((s) => s.setStripModelId);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const bumpData = useAppStore((s) => s.bumpData);

  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const [name, setNameL] = useState("");
  const [email, setEmailL] = useState("");
  const [mode, setMode] = useState<UseCaseId>("pool");
  const [stripId, setStripId] = useState(DEFAULT_STRIP_ID);
  const [locName, setLocName] = useState("");
  const [locIcon, setLocIcon] = useState<IconName>("pool");

  const locSuggestion = mode === "pool" ? "Minha piscina" : "Meu aquário";
  const icons = ICONS_BY_CASE[mode];

  const canProceed = step === "identity" ? name.trim().length > 0 : true;

  async function finish() {
    setName(name.trim());
    setEmail(email.trim());
    setUseCaseId(mode);
    setStripModelId(stripId);
    await createSample({
      name: locName.trim() || locSuggestion,
      sub: "",
      useCase: mode,
      icon: locIcon,
      color: phToColor(USE_CASES[mode].ideal),
    });
    bumpData();
    setOnboarded(true);
    router.replace("/");
  }

  function next() {
    if (!canProceed) return;
    if (isLast) void finish();
    else setStepIdx((i) => i + 1);
  }

  function chooseMode(id: UseCaseId) {
    setMode(id);
    if (!ICONS_BY_CASE[id].includes(locIcon)) setLocIcon(ICONS_BY_CASE[id][0]);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PALETTE.bg,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
      }}
    >
      {/* Progresso */}
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= stepIdx ? PALETTE.ink : "rgba(0,0,0,0.1)" }}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 16, flexGrow: 1 }}
      >
        {step === "intro" && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
            <Logo size={88} primary={primary} />
            <Text style={{ fontFamily: FONTS.light, fontSize: 30, color: PALETTE.ink, letterSpacing: -0.6 }}>Hidro Scan</Text>
            <Text style={title}>Meça o pH com sua câmera</Text>
            <Text style={[subtitle, { textAlign: "center" }]}>
              Analise fotos de tiras de teste e receba o pH em segundos. 100% offline, sem conta.
            </Text>
          </View>
        )}

        {step === "identity" && (
          <View>
            <Text style={title}>Como te chamamos?</Text>
            <Text style={subtitle}>Fica só no seu aparelho — o app não tem conta nem nuvem.</Text>
            <View style={{ height: 22 }} />
            <Text style={fieldLabel}>Nome</Text>
            <TextInput value={name} onChangeText={setNameL} placeholder="Seu nome" placeholderTextColor={PALETTE.muted40} style={input} />
            <Text style={fieldLabel}>Email (opcional)</Text>
            <TextInput
              value={email}
              onChangeText={setEmailL}
              placeholder="voce@email.com"
              placeholderTextColor={PALETTE.muted40}
              autoCapitalize="none"
              keyboardType="email-address"
              style={input}
            />
          </View>
        )}

        {step === "mode" && (
          <View>
            <Text style={title}>O que você monitora?</Text>
            <Text style={subtitle}>Personaliza as faixas seguras e as recomendações.</Text>
            <View style={{ height: 22 }} />
            <View style={{ gap: 12 }}>
              {Object.values(USE_CASES).map((u) => {
                const active = mode === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => chooseMode(u.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: active ? PALETTE.ink : PALETTE.surface,
                      borderWidth: active ? 0 : 0.5,
                      borderColor: "rgba(0,0,0,0.1)",
                    }}
                  >
                    <Icon name={u.samples[0].icon as IconName} size={24} color={active ? "#fff" : PALETTE.ink} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: active ? "#fff" : PALETTE.ink }}>{u.name}</Text>
                      <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: active ? "rgba(255,255,255,0.6)" : PALETTE.muted50, marginTop: 2 }}>
                        Faixa segura {u.safeRange[0]}–{u.safeRange[1]}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === "strip" && (
          <View>
            <Text style={title}>Qual sua tira de teste?</Text>
            <Text style={subtitle}>Escolha o modelo que você usa. A leitura se ajusta aos campos da tira.</Text>
            <View style={{ height: 18 }} />
            <StripModelList selectedId={stripId} onSelect={setStripId} primary={primary} />
          </View>
        )}

        {step === "location" && (
          <View>
            <Text style={title}>Seu primeiro local</Text>
            <Text style={subtitle}>Onde você vai medir. Pode adicionar outros depois.</Text>
            <View style={{ height: 22 }} />
            <Text style={fieldLabel}>Nome</Text>
            <TextInput value={locName} onChangeText={setLocName} placeholder={locSuggestion} placeholderTextColor={PALETTE.muted40} style={input} />
            <Text style={fieldLabel}>Ícone</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {icons.map((ic) => {
                const active = locIcon === ic;
                return (
                  <Pressable
                    key={ic}
                    onPress={() => setLocIcon(ic)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active ? primary : PALETTE.surface,
                      borderWidth: active ? 0 : 0.5,
                      borderColor: "rgba(0,0,0,0.1)",
                    }}
                  >
                    <Icon name={ic} size={22} color={PALETTE.ink} strokeWidth={1.8} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Rodapé */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        {stepIdx > 0 && (
          <Pressable
            onPress={() => setStepIdx((i) => i - 1)}
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chevL" size={20} color={PALETTE.ink} />
          </Pressable>
        )}
        <Pressable
          onPress={next}
          disabled={!canProceed}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 18,
            backgroundColor: PALETTE.ink,
            opacity: canProceed ? 1 : 0.5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            ...SHADOWS.black,
          }}
        >
          <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: "#fff" }}>{isLast ? "Começar a medir" : "Continuar"}</Text>
          <Icon name="chevR" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const title = {
  fontFamily: FONTS.regular,
  fontSize: 30,
  color: PALETTE.ink,
  letterSpacing: -0.6,
  lineHeight: 34,
} as const;

const subtitle = {
  fontFamily: FONTS.regular,
  fontSize: 14,
  color: "rgba(0,0,0,0.6)",
  lineHeight: 21,
  marginTop: 12,
} as const;

const fieldLabel = {
  fontFamily: FONTS.regular,
  fontSize: 12,
  color: PALETTE.muted55,
  marginBottom: 8,
} as const;

const input = {
  height: 50,
  borderRadius: 14,
  backgroundColor: PALETTE.surface,
  borderWidth: 0.5,
  borderColor: "rgba(0,0,0,0.1)",
  paddingHorizontal: 14,
  fontFamily: FONTS.regular,
  fontSize: 15,
  color: PALETTE.ink,
  marginBottom: 16,
} as const;
