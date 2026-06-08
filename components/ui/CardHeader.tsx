import React from "react";
import { View, Text } from "react-native";
import { Icon, type IconName } from "./Icon";
import { PALETTE, FONTS } from "../../lib/theme/tokens";

type Props = {
  icon?: IconName;
  label: string;
  action?: React.ReactNode; // passe null para esconder; undefined usa o padrão (seta)
};

export function CardHeader({ icon, label, action }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
        {icon ? (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              backgroundColor: "rgba(10,10,10,0.06)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={icon} size={13} strokeWidth={1.8} />
          </View>
        ) : null}
        <Text numberOfLines={1} style={{ color: PALETTE.muted55, fontSize: 12, fontFamily: FONTS.regular }}>
          {label}
        </Text>
      </View>
      {action !== undefined ? action : <Icon name="arrowUR" size={14} color={PALETTE.muted40} />}
    </View>
  );
}

export default CardHeader;
