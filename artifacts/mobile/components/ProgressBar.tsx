import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  progress: number;
  colors: any;
  height?: number;
};

export function ProgressBar({ progress, colors, height = 8 }: Props) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.border, height },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: colors.tint,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 100,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 100,
  },
});
