import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { DiscountCard } from "@/components/DiscountCard";
import { LevelBadge } from "@/components/LevelBadge";

const LEVEL_ORDER = ["bronze", "silver", "gold", "platinum"];

function canUseDiscount(
  patientLevel: string,
  requiredLevel: string
): boolean {
  return LEVEL_ORDER.indexOf(patientLevel) >= LEVEL_ORDER.indexOf(requiredLevel);
}

const FILTER_TABS = ["الكل", "متاح", "مستخدم"];

export default function DiscountsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { discounts, patient, markDiscountUsed } = useAppContext();
  const [activeFilter, setActiveFilter] = useState("الكل");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = discounts.filter((d) => {
    if (activeFilter === "متاح") return !d.isUsed && canUseDiscount(patient.level, d.requiredLevel);
    if (activeFilter === "مستخدم") return d.isUsed;
    return true;
  });

  const availableCount = discounts.filter(
    (d) => !d.isUsed && canUseDiscount(patient.level, d.requiredLevel)
  ).length;

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
          خصوماتي
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary banner */}
      <View
        style={[styles.summaryBanner, { backgroundColor: colors.tint + "12" }]}
      >
        <View style={styles.summaryRight}>
          <LevelBadge level={patient.level} size="medium" />
          <View style={styles.summaryText}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              مستواك يمنحك خصومات حصرية
            </Text>
            <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
              {availableCount} خصم متاح الآن
            </Text>
          </View>
        </View>
        <View style={[styles.summaryCircle, { backgroundColor: colors.tint }]}>
          <Text style={styles.summaryCount}>{availableCount}</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveFilter(tab)}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  activeFilter === tab ? colors.tint : colors.backgroundCard,
                borderColor:
                  activeFilter === tab ? colors.tint : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeFilter === tab ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad + 20 },
        ]}
        renderItem={({ item }) => (
          <DiscountCard
            discount={item}
            colors={colors}
            canUse={canUseDiscount(patient.level, item.requiredLevel)}
            onUse={() => markDiscountUsed(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="percent" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              لا توجد خصومات
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {activeFilter === "متاح"
                ? "ارفع مستواك لفتح المزيد من الخصومات"
                : "لا توجد خصومات في هذه الفئة"}
            </Text>
          </View>
        }
      />
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
  summaryBanner: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  summarySubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  summaryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCount: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
