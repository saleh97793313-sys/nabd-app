import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type PointsEntry = {
  id: number;
  type: string;
  points: number;
  description: string;
  clinicName: string | null;
  createdAt: string;
};

function getApiBase(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (Platform.OS === "web") return "/api";
  if (domain) return `https://${domain}/api`;
  return "/api";
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  visit: { icon: "calendar", color: "#00C896", label: "زيارة" },
  bonus: { icon: "gift", color: "#FFB800", label: "مكافأة" },
  manual: { icon: "edit-3", color: "#7C3AED", label: "يدوي" },
  registration: { icon: "user-plus", color: "#3B82F6", label: "تسجيل" },
};

export default function PointsHistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { patient } = useAppContext();

  const [entries, setEntries] = useState<PointsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient.phone) return;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/points-log/by-phone?phone=${encodeURIComponent(patient.phone)}`);
        if (res.ok) setEntries(await res.json());
      } catch {}
      setLoading(false);
    })();
  }, [patient.phone]);

  const topPadding = Platform.OS === "web" ? 20 : insets.top;
  const totalEarned = entries.filter(e => e.points > 0).reduce((s, e) => s + e.points, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.backgroundCard }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>سجل النقاط</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.tint }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{patient.points.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>الرصيد الحالي</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalEarned.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>إجمالي المكتسب</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{entries.length}</Text>
            <Text style={styles.summaryLabel}>العمليات</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.tint + "15" }]}>
              <Feather name="inbox" size={40} color={colors.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد عمليات بعد</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              ستظهر نقاطك هنا بعد كل زيارة
            </Text>
          </View>
        ) : (
          entries.map((entry, index) => {
            const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.visit;
            const isPositive = entry.points > 0;
            const dateStr = new Date(entry.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <View
                key={entry.id}
                style={[
                  styles.entryCard,
                  { backgroundColor: colors.backgroundCard },
                  index === 0 && { marginTop: 16 },
                ]}
              >
                <View style={styles.entryRow}>
                  <View style={[styles.pointsBadge, { backgroundColor: isPositive ? "#00C89615" : "#EF444415" }]}>
                    <Text
                      style={[
                        styles.pointsText,
                        { color: isPositive ? "#00C896" : "#EF4444" },
                      ]}
                    >
                      {isPositive ? "+" : ""}{entry.points}
                    </Text>
                  </View>

                  <View style={styles.entryContent}>
                    <Text style={[styles.entryDescription, { color: colors.text }]}>
                      {entry.description}
                    </Text>
                    {entry.clinicName && (
                      <Text style={[styles.entryClinic, { color: colors.textSecondary }]}>
                        {entry.clinicName}
                      </Text>
                    )}
                    <View style={styles.entryMeta}>
                      <View style={[styles.typeBadge, { backgroundColor: cfg.color + "15" }]}>
                        <Feather name={cfg.icon as any} size={10} color={cfg.color} />
                        <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Text style={[styles.entryDate, { color: colors.textMuted }]}>{dateStr}</Text>
                    </View>
                  </View>

                  <View style={[styles.entryIcon, { backgroundColor: cfg.color + "15" }]}>
                    <Feather name={cfg.icon as any} size={18} color={cfg.color} />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#00C896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: { alignItems: "center", gap: 4 },
  summaryValue: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_500Medium" },
  summaryDivider: { width: 1, height: 36 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  entryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  entryContent: { flex: 1, gap: 6 },
  entryDescription: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  entryClinic: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  entryMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  entryDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  pointsText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
