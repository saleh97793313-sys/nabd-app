import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { offers, patient, redeemOffer, bookAppointment } = useAppContext();
  const [redeemed, setRedeemed] = useState(false);

  const offer = offers.find((o) => o.id === id);
  if (!offer) return null;

  const discount = Math.round(
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  );

  const canRedeem = patient.points >= offer.pointsRequired;
  const savings = offer.originalPrice - offer.discountedPrice;

  const handleRedeem = () => {
    if (!canRedeem) {
      Alert.alert(
        "نقاط غير كافية",
        `تحتاج ${offer.pointsRequired - patient.points} نقطة إضافية لاستخدام هذا العرض`,
        [{ text: "حسناً" }]
      );
      return;
    }
    Alert.alert(
      "تأكيد الاستخدام",
      `هل تريد استخدام هذا العرض؟\nستحصل على +${offer.pointsEarned} نقطة`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم، استخدم",
          onPress: () => {
            redeemOffer(offer.id);
            bookAppointment(offer.clinicId);
            setRedeemed(true);
          },
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.backgroundCard }]}
        >
          <Feather name="chevron-right" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          تفاصيل العرض
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero */}
        <View
          style={[styles.heroCard, { backgroundColor: colors.tint + "15" }]}
        >
          <View
            style={[styles.discountCircle, { backgroundColor: colors.danger }]}
          >
            <Text style={styles.discountPct}>-{discount}%</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={[styles.category, { color: colors.tint }]}>
              {offer.category}
            </Text>
            <Text style={[styles.offerTitle, { color: colors.text }]}>
              {offer.title}
            </Text>
            <Text style={[styles.clinicName, { color: colors.textSecondary }]}>
              {offer.clinicName}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Price */}
          <View
            style={[styles.priceCard, { backgroundColor: colors.backgroundCard }]}
          >
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                  السعر الأصلي
                </Text>
                <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                  {offer.originalPrice} ر.ع
                </Text>
              </View>
              <Feather name="arrow-left" size={20} color={colors.textMuted} />
              <View style={styles.discountedSection}>
                <Text style={[styles.priceLabel, { color: colors.tint }]}>
                  سعر العرض
                </Text>
                <Text style={[styles.discountedPrice, { color: colors.tint }]}>
                  {offer.discountedPrice} ر.ع
                </Text>
              </View>
            </View>
            <View style={[styles.savingsRow, { backgroundColor: colors.tint + "10" }]}>
              <Text style={[styles.savingsText, { color: colors.tint }]}>
                توفر {savings} ر.ع مع هذا العرض!
              </Text>
              <Feather name="trending-down" size={16} color={colors.tint} />
            </View>
          </View>

          {/* Description */}
          <View
            style={[styles.descCard, { backgroundColor: colors.backgroundCard }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              تفاصيل العرض
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {offer.description}
            </Text>
          </View>

          {/* Points */}
          <View
            style={[styles.pointsCard, { backgroundColor: colors.backgroundCard }]}
          >
            <View style={styles.pointsRow}>
              <View style={styles.pointItem}>
                <View style={[styles.pointIcon, { backgroundColor: colors.accent + "15" }]}>
                  <Feather name="star" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.pointValue, { color: colors.accent }]}>
                  +{offer.pointsEarned}
                </Text>
                <Text style={[styles.pointDesc, { color: colors.textSecondary }]}>
                  نقطة تكسب
                </Text>
              </View>

              {offer.pointsRequired > 0 && (
                <>
                  <View
                    style={[styles.pointDivider, { backgroundColor: colors.border }]}
                  />
                  <View style={styles.pointItem}>
                    <View
                      style={[
                        styles.pointIcon,
                        {
                          backgroundColor: canRedeem
                            ? colors.tint + "15"
                            : colors.danger + "15",
                        },
                      ]}
                    >
                      <Feather
                        name="zap"
                        size={20}
                        color={canRedeem ? colors.tint : colors.danger}
                      />
                    </View>
                    <Text
                      style={[
                        styles.pointValue,
                        { color: canRedeem ? colors.tint : colors.danger },
                      ]}
                    >
                      {offer.pointsRequired}
                    </Text>
                    <Text
                      style={[styles.pointDesc, { color: colors.textSecondary }]}
                    >
                      نقطة مطلوبة
                    </Text>
                  </View>
                </>
              )}
            </View>
            {!canRedeem && offer.pointsRequired > 0 && (
              <Text style={[styles.insufficientText, { color: colors.danger }]}>
                نقاطك الحالية: {patient.points} (تحتاج {offer.pointsRequired - patient.points} إضافية)
              </Text>
            )}
          </View>

          {/* Expiry */}
          <View style={[styles.expiryCard, { backgroundColor: colors.backgroundCard }]}>
            <Feather name="clock" size={16} color={colors.textMuted} />
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
              ينتهي العرض بتاريخ: {offer.expiryDate}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.backgroundCard,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
          },
        ]}
      >
        {redeemed ? (
          <View style={[styles.redeemedBtn, { backgroundColor: colors.tint }]}>
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.redeemedText}>تم الحجز بنجاح!</Text>
          </View>
        ) : (
          <Pressable
            onPress={handleRedeem}
            style={({ pressed }) => [
              styles.redeemBtn,
              {
                backgroundColor: canRedeem ? colors.tint : colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.redeemText,
                { color: canRedeem ? "#fff" : colors.textMuted },
              ]}
            >
              {offer.pointsRequired > 0
                ? `استخدم ${offer.pointsRequired} نقطة`
                : "احجز الآن"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  heroCard: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  discountCircle: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  discountPct: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  heroContent: {
    alignItems: "flex-end",
    gap: 6,
    paddingLeft: 60,
  },
  category: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  offerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 32,
  },
  clinicName: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
  },
  priceCard: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
    textAlign: "center",
  },
  discountedSection: {
    alignItems: "center",
  },
  discountedPrice: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  savingsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  descCard: {
    borderRadius: 20,
    padding: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 22,
  },
  pointsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  pointsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
  },
  pointItem: {
    alignItems: "center",
    gap: 6,
  },
  pointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pointValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  pointDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  pointDivider: {
    width: 1,
    height: 60,
  },
  insufficientText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  expiryCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  expiryText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  redeemBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  redeemText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  redeemedBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 8,
  },
  redeemedText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
