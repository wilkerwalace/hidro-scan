import React from "react";
import { View, Text } from "react-native";
import { previewPoints, type StripModel } from "../../lib/strips/catalog";
import { PALETTE, FONTS } from "../../lib/theme/tokens";

// Prévia da tabela de referência: colunas de pH, cada uma com seus N campos.
export function StripPreview({ model, columns = 8 }: { model: StripModel; columns?: number }) {
  const points = previewPoints(model, columns);
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {points.map((p, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              borderRadius: 6,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            {p.pads.map((c, j) => (
              <View key={j} style={{ height: 13, backgroundColor: c }} />
            ))}
          </View>
          <Text style={{ fontSize: 8, color: PALETTE.muted50, fontFamily: FONTS.regular, marginTop: 3 }}>
            {p.ph % 1 === 0 ? p.ph.toFixed(0) : p.ph.toFixed(1)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default StripPreview;
