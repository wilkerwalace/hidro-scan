import React from "react";
import { View, Text } from "react-native";
import { STRIP_MODELS } from "../lib/strips/catalog";
import { StripPreview } from "./ui/StripPreview";
import { Icon } from "./ui/Icon";
import { Card } from "./ui/Card";
import { PALETTE, FONTS } from "../lib/theme/tokens";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  primary: string;
};

// Lista selecionável do catálogo de tiras (usada no onboarding e no Perfil).
export function StripModelList({ selectedId, onSelect, primary }: Props) {
  return (
    <View style={{ gap: 10 }}>
      {STRIP_MODELS.map((m) => {
        const active = selectedId === m.id;
        return (
          <Card
            key={m.id}
            padding={14}
            onPress={() => onSelect(m.id)}
            style={active ? { borderColor: primary, borderWidth: 1.5 } : undefined}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: PALETTE.ink }}>{m.name}</Text>
                <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: PALETTE.muted50, marginTop: 1 }}>
                  {m.brand} · {m.padCount} {m.padCount > 1 ? "campos" : "campo"}
                  {m.approximate ? " · aprox." : ""}
                </Text>
              </View>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? PALETTE.ink : "transparent",
                  borderWidth: active ? 0 : 1,
                  borderColor: "rgba(0,0,0,0.15)",
                }}
              >
                {active ? <Icon name="check" size={13} color="#fff" /> : null}
              </View>
            </View>
            <StripPreview model={m} columns={8} />
          </Card>
        );
      })}
    </View>
  );
}

export default StripModelList;
