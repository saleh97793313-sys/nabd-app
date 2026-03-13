import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Clinic } from "@/context/AppContext";

type Props = {
  clinic: Clinic;
  colors: any;
  onPress?: () => void;
};

export function ClinicCard({ clinic, colors, onPress }: Props) {
  const initials = clinic.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundCard,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      {/* Avatar */}
      <View
        style={[styles.avatar, { backgroundColor: colors.tint + "15" }]}
      >
        <Text style={[styles.avatarText, { color: colors.tint }]}>
          {initials}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          {clinic.verified && (
            <Feather name="check-circle" size={14} color={colors.tint} />
          )}
          <Text
            style={[styles.clinicName, { color: colors.text }]}
            numberOfLines={1}
          >
            {clinic.name}
          </Text>
        </View>

        <Text style={[styles.specialty, { color: colors.textSecondary }]}>
          {clinic.specialty}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="tag" size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {clinic.offerCount} عروض
            </Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {clinic.totalPatients.toLocaleString()}+ مريض
            </Text>
          </View>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingSection}>
        <View style={[styles.ratingBadge, { backgroundColor: colors.accent + "15" }]}>
          <Feather name="star" size={13} color={colors.accent} />
          <Text style={[styles.ratingText, { color: colors.accent }]}>
            {clinic.rating}
          </Text>
        </View>
        <Feather name="chevron-left" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  clinicName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    flex: 1,
  },
  specialty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  ratingSection: {
    alignItems: "center",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
