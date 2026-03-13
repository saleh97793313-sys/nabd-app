import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Level = "bronze" | "silver" | "gold" | "platinum";

const LEVEL_CONFIG: Record<
  Level,
  { label: string; color: string; bg: string; icon: string }
> = {
  bronze: {
    label: "برونزي",
    color: "#CD7F32",
    bg: "#FDF3E7",
    icon: "award",
  },
  silver: {
    label: "فضي",
    color: "#708090",
    bg: "#F0F4F8",
    icon: "award",
  },
  gold: {
    label: "ذهبي",
    color: "#FFB800",
    bg: "#FFF8E1",
    icon: "star",
  },
  platinum: {
    label: "بلاتيني",
    color: "#00B8D9",
    bg: "#E0F7FA",
    icon: "zap",
  },
};

type Props = {
  level: Level;
  size?: "small" | "medium" | "large";
};

export function LevelBadge({ level, size = "medium" }: Props) {
  const config = LEVEL_CONFIG[level];

  const sizeStyles = {
    small: { padding: 4, paddingHorizontal: 8, fontSize: 11, iconSize: 11 },
    medium: { padding: 6, paddingHorizontal: 12, fontSize: 13, iconSize: 13 },
    large: { padding: 8, paddingHorizontal: 16, fontSize: 15, iconSize: 15 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingVertical: sizeStyles.padding,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
      ]}
    >
      <Feather
        name={config.icon as any}
        size={sizeStyles.iconSize}
        color={config.color}
      />
      <Text
        style={[
          styles.label,
          { color: config.color, fontSize: sizeStyles.fontSize },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
  },
});
