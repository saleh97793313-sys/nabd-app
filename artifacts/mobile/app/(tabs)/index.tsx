import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TextInput,
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
  const { patient, offers, clinics, clinicsLoading, discounts, unreadCount, markDiscountUsed } = useAppContext();

  const featuredOffers = offers.filter((o) => o.isFeatured).slice(0, 3);
  const topClinics = clinics.slice(0, 3);
  const availableDiscounts = discounts.filter(
    (d) => !d.isUsed && canUseDiscount(patient.level, d.requiredLevel)
  ).slice(0, 2);

  const topPadding = Platform.OS === "web" ? 40 : insets.top;

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
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              مرحباً بك 👋
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {patient.name}
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundCard }]}>
            <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="ابحث عن عيادة أو خدمة..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              editable={false}
            />
          </View>
        </View>

        {/* Points Card */}
        <View style={styles.section}>
          <PointsCard patient={patient} colors={colors} />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: colors.tint + "15" }]}>
              <Feather name="activity" size={18} color={colors.tint} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {patient.totalVisits}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              زيارة
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: colors.accent + "15" }]}>
              <Feather name="folder" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {patient.conditions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              ملفات
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.statIconWrapper}>
              <LevelBadge level={patient.level} size="small" />
            </View>
            <Text style={[styles.statValue, { color: colors.text, fontSize: 16, marginTop: 4 }]}>
              {patient.level === 'bronze' ? 'برونزي' : patient.level === 'silver' ? 'فضي' : patient.level === 'gold' ? 'ذهبي' : 'بلاتيني'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              المستوى
            </Text>
          </View>
        </View>

        {/* My Discounts */}
        {availableDiscounts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: colors.tint }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  خصوماتي الحصرية
                </Text>
              </View>
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
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: colors.tint }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              عروض مميزة لك
            </Text>
          </View>
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
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: colors.tint }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              عيادات موصى بها
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/offers")}>
            <Text style={[styles.seeAll, { color: colors.tint }]}>
              عرض الكل
            </Text>
          </Pressable>
        </View>

        {clinicsLoading ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        ) : (
          <View style={styles.clinicsList}>
            {topClinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                colors={colors}
                onPress={() => router.push(`/clinic/${clinic.id}`)}
              />
            ))}
          </View>
        )}
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
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  titleAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
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
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 16,
    marginBottom: 32,
  },
  discountsSection: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  clinicsList: {
    paddingHorizontal: 4, // 20 in card + 4 = 24
  },
});