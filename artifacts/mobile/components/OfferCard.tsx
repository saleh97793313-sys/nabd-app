import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Offer } from "@/context/AppContext";

type Props = {
  offer: Offer;
  colors: any;
  compact?: boolean;
  onPress?: () => void;
};

export function OfferCard({ offer, colors, compact = false, onPress }: Props) {
  const discount = Math.round(
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  );

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: colors.backgroundCard, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.compactBadge}>
          <Text style={styles.compactBadgeText}>-{discount}%</Text>
        </View>

        {offer.isFeatured && (
          <View
            style={[
              styles.featuredDot,
              { backgroundColor: colors.accent },
            ]}
          />
        )}

        <View style={styles.compactContent}>
          <Text
            style={[styles.compactClinic, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {offer.clinicSpecialty}
          </Text>
          <Text
            style={[styles.compactTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {offer.title}
          </Text>

          <View style={styles.compactPriceRow}>
            <Text style={[styles.compactPrice, { color: colors.tint }]}>
              {offer.discountedPrice} ر.ع
            </Text>
            <Text style={[styles.compactOriginal, { color: colors.textMuted }]}>
              {offer.originalPrice}
            </Text>
          </View>

          <View style={styles.compactPoints}>
            <Feather name="star" size={11} color={colors.accent} />
            <Text style={[styles.compactPointsText, { color: colors.textSecondary }]}>
              +{offer.pointsEarned} نقطة
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

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
      {/* Discount badge */}
      <View style={[styles.discountBadge, { backgroundColor: colors.danger }]}>
        <Text style={styles.discountText}>-{discount}%</Text>
      </View>

      <View style={styles.cardBody}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: colors.tint }]}>
              {offer.category}
            </Text>
          </View>
          {offer.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.accent + "20" }]}>
              <Feather name="star" size={11} color={colors.accent} />
              <Text style={[styles.featuredText, { color: colors.accent }]}>
                مميز
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <Text style={[styles.clinicName, { color: colors.textSecondary }]}>
          {offer.clinicName} · {offer.clinicSpecialty}
        </Text>
        <Text style={[styles.offerTitle, { color: colors.text }]}>
          {offer.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {offer.description}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.priceSection}>
            <Text style={[styles.discountedPrice, { color: colors.tint }]}>
              {offer.discountedPrice} ر.ع
            </Text>
            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
              {offer.originalPrice} ر.ع
            </Text>
          </View>

          <View style={styles.rightSection}>
            <View
              style={[
                styles.pointsPill,
                { backgroundColor: colors.accent + "15" },
              ]}
            >
              <Feather name="star" size={12} color={colors.accent} />
              <Text style={[styles.pointsText, { color: colors.accent }]}>
                +{offer.pointsEarned}
              </Text>
            </View>
            {offer.pointsRequired > 0 && (
              <Text style={[styles.requiredPoints, { color: colors.textMuted }]}>
                يتطلب {offer.pointsRequired} نقطة
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.expiryRow, { borderTopColor: colors.border }]}>
          <Feather name="clock" size={12} color={colors.textMuted} />
          <Text style={[styles.expiryText, { color: colors.textMuted }]}>
            ينتهي: {offer.expiryDate}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactCard: {
    width: 180,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  compactBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF4757",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  compactBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  featuredDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  compactContent: {
    padding: 14,
    gap: 4,
  },
  compactClinic: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 20,
  },
  compactPriceRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  compactPrice: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  compactOriginal: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  compactPoints: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  compactPointsText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },

  // Full card styles
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  discountBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  cardBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingRight: 0,
    paddingLeft: 50,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0, 200, 150, 0.1)",
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  featuredBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  clinicName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  priceSection: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 8,
  },
  discountedPrice: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 4,
  },
  pointsPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  requiredPoints: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  expiryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
