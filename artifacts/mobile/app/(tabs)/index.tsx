import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
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
import { LevelBadge } from "@/components/LevelBadge";
import { PointsCard } from "@/components/PointsCard";
import { OfferCard } from "@/components/OfferCard";
import { ClinicCard } from "@/components/ClinicCard";
import { DiscountCard } from "@/components/DiscountCard";

const LEVEL_ORDER = ["bronze", "silver", "gold", "platinum"];
function canUseDiscount(patientLevel: string, requiredLevel: string) {
  return LEVEL_ORDER.indexOf(patientLevel) >= LEVEL_ORDER.indexOf(requiredLevel);
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { patient, offers, clinics, discounts, unreadCount, markDiscountUsed } = useAppContext();

  const featuredOffers = offers.filter((o) => o.isFeatured).slice(0, 3);
  const topClinics = clinics.slice(0, 3);
  const availableDiscounts = discounts.filter(
    (d) => !d.isUsed && canUseDiscount(patient.level, d.requiredLevel)
  ).slice(0, 2);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 100 : 100,
          paddingTop: topPadding + 16,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              مرحباً 👋
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {patient.name.split(" ")[0]} {patient.name.split(" ")[1]}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/notifications")}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.backgroundCard },
              ]}
            >
              <Feather name="bell" size={20} color={colors.text} />
              {unreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.danger }]}
                >
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Points Card */}
        <View style={styles.section}>
          <PointsCard patient={patient} colors={colors} />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}
          >
            <Text style={[styles.statValue, { color: colors.tint }]}>
              {patient.totalVisits}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              زيارة
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}
          >
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {patient.conditions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              حالات متابعة
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}
          >
            <LevelBadge level={patient.level} size="small" />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              مستواك
            </Text>
          </View>
        </View>

        {/* My Discounts */}
        {availableDiscounts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                خصوماتي الحصرية
              </Text>
              <Pressable onPress={() => router.push("/discounts")}>
                <Text style={[styles.seeAll, { color: colors.tint }]}>
                  عرض الكل
                </Text>
              </Pressable>
            </View>
            <View style={styles.discountsSection}>
              {availableDiscounts.map((d) => (
                <DiscountCard
                  key={d.id}
                  discount={d}
                  colors={colors}
                  canUse={true}
                  onUse={() => markDiscountUsed(d.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Featured Offers */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            عروض مميزة لك
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/offers")}>
            <Text style={[styles.seeAll, { color: colors.tint }]}>
              عرض الكل
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {featuredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              colors={colors}
              compact
              onPress={() => router.push(`/offer/${offer.id}`)}
            />
          ))}
        </ScrollView>

        {/* Top Clinics */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            عيادات موصى بها
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/offers")}>
            <Text style={[styles.seeAll, { color: colors.tint }]}>
              عرض الكل
            </Text>
          </Pressable>
        </View>

        {topClinics.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            clinic={clinic}
            colors={colors}
            onPress={() => router.push(`/clinic/${clinic.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 12,
    marginBottom: 24,
  },
  discountsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
});
