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
      <View style={[styles.leftAccent, { backgroundColor: colors.tint }]} />
      
      <View style={styles.cardContent}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.tint }]}>
            {initials}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.clinicName, { color: colors.text }]} numberOfLines={1}>
              {clinic.name}
            </Text>
            {clinic.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                <Feather name="check" size={8} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.tagsRow}>
            <View style={[styles.specialtyBadge, { backgroundColor: colors.tint + "12" }]}>
              <Text style={[styles.specialtyText, { color: colors.tint }]}>
                {clinic.specialty}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Feather name="star" size={12} color={colors.accent} style={{ marginTop: -2 }} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {clinic.rating}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row-reverse",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  leftAccent: {
    width: 4,
    borderRadius: 4,
    marginVertical: 12,
    marginLeft: 12,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  clinicName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  specialtyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  ratingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});