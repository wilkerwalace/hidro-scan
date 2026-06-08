import { Stack } from "expo-router";

// Agrupa o fluxo de captura (viewfinder -> analyzing -> result) sob a rota
// "/capture", apresentada como modal de tela cheia pelo _layout raiz.
export default function CaptureLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0A" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="align" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
