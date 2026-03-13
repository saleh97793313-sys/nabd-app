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

  const isExpiringSoon = new Date(offer.expiryDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: colors.backgroundCard, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={[styles.topBanner, { backgroundColor: colors.tint }]} />
        <View style={styles.compactContent}>
          <View style={styles.compactHeaderRow}>
            {offer.isFeatured && (
              <View style={[styles.featuredBadge, { backgroundColor: colors.accent + "15" }]}>
                <Feather name="star" size={10} color={colors.accent} />
                <Text style={[styles.featuredText, { color: colors.accent }]}>مميز</Text>
              </View>
            )}
            <View style={[styles.discountBadgeCompact, { backgroundColor: colors.accent }]}>
              <Text style={styles.discountTextCompact}>خصم {discount}%</Text>
            </View>
          </View>

          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
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
      <View style={[styles.topBanner, { backgroundColor: colors.tint }]} />
      
      <View style={styles.cardBody}>
        {/* Absolute Badges */}
        <View style={styles.badgesContainer}>
           <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.discountText}>خصم {discount}%</Text>
          </View>
        </View>

        {offer.isFeatured && (
          <View style={styles.featuredBadgeWrapper}>
            <View style={[styles.featuredBadge, { backgroundColor: colors.accent + "15" }]}>
              <Feather name="star" size={12} color={colors.accent} />
              <Text style={[styles.featuredText, { color: colors.accent }]}>مميز</Text>
            </View>
          </View>
        )}

        {/* Content */}
        <Text style={[styles.clinicName, { color: colors.textSecondary }]}>
          {offer.clinicName} · {offer.clinicSpecialty}
        </Text>
        <Text style={[styles.offerTitle, { color: colors.text }]}>
          {offer.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
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

          <View style={styles.pointsBadge}>
            <Feather name="circle" size={14} color={colors.accent} />
            <Text style={[styles.pointsBadgeText, { color: colors.accent }]}>
              {offer.pointsEarned} نقطة مكتسبة
            </Text>
          </View>
        </View>

        <View style={styles.expiryRow}>
          <View style={[styles.expiryChip, { backgroundColor: isExpiringSoon ? colors.danger + "15" : colors.textMuted + "15" }]}>
            <Text style={[styles.expiryText, { color: isExpiringSoon ? colors.danger : colors.textMuted }]}>
              ينتهي: {offer.expiryDate}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactCard: {
    width: 200,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topBanner: {
    height: 8,
    width: "100%",
  },
  compactContent: {
    padding: 16,
    gap: 8,
  },
  compactHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    height: 24,
  },
  discountBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountTextCompact: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  compactTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 22,
    minHeight: 44,
  },
  compactPriceRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  compactPrice: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  compactOriginal: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },

  // Full card styles
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardBody: {
    padding: 16,
    position: "relative",
  },
  badgesContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  discountText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  featuredBadgeWrapper: {
    flexDirection: "row-reverse",
    marginBottom: 8,
  },
  featuredBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  clinicName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginBottom: 4,
    paddingRight: 80, // Space for discount badge
  },
  offerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 8,
    paddingRight: 80,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 8,
  },
  discountedPrice: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  originalPrice: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  pointsBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  pointsBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  expiryRow: {
    flexDirection: "row-reverse",
  },
  expiryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});