import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ProgressBar";

const LEVEL_CONFIG = {
  bronze: { label: "برونزي", nextLabel: "فضي", current: 0, next: 1000, color: "#CD7F32" },
  silver: { label: "فضي", nextLabel: "ذهبي", current: 1000, next: 3000, color: "#A8A9AD" },
  gold: { label: "ذهبي", nextLabel: "بلاتيني", current: 3000, next: 6000, color: "#FFB800" },
  platinum: { label: "بلاتيني", nextLabel: "القمة!", current: 6000, next: 6000, color: "#00C8FF" },
};

const MENU_ITEMS = [
  { icon: "heart", label: "حالاتي الصحية", value: "", arrow: true },
  { icon: "star", label: "سجل النقاط", value: "", arrow: true },
  { icon: "shield", label: "التأمين الصحي", value: "", arrow: true },
  { icon: "bell", label: "الإشعارات", value: "", arrow: true },
  { icon: "help-circle", label: "المساعدة", value: "", arrow: true },
  { icon: "info", label: "عن التطبيق", value: "1.0.0", arrow: false },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { patient, logout } = useAppContext();

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const levelConfig = LEVEL_CONFIG[patient.level];
  const progress = Math.min(
    (patient.points - levelConfig.current) /
      (levelConfig.next - levelConfig.current),
    1
  );

  const initials = patient.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: (Platform.OS === "web" ? 100 : 100) + bottomPadding,
        paddingTop: topPadding + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View
          style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}
        >
          <Text style={[styles.avatarText, { color: colors.tint }]}>
            {initials}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {patient.name}
        </Text>
        <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>
          {patient.phone}
        </Text>
        <View style={styles.levelRow}>
          <LevelBadge level={patient.level} size="medium" />
        </View>
      </View>

      {/* Points Progress */}
      <View
        style={[
          styles.progressCard,
          { backgroundColor: colors.backgroundCard },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            التقدم نحو المستوى {levelConfig.nextLabel}
          </Text>
          <Text style={[styles.pointsCount, { color: colors.tint }]}>
            {patient.points.toLocaleString()} نقطة
          </Text>
        </View>

        <ProgressBar progress={progress} colors={colors} />

        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {levelConfig.next.toLocaleString()}
          </Text>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {levelConfig.current.toLocaleString()}
          </Text>
        </View>

        <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
          تحتاج {(levelConfig.next - patient.points).toLocaleString()} نقطة للمستوى التالي
        </Text>
      </View>

      {/* Conditions */}
      {patient.conditions.length > 0 && (
        <View
          style={[
            styles.conditionsCard,
            { backgroundColor: colors.backgroundCard },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            الحالات الصحية المتابعة
          </Text>
          <View style={styles.conditionChips}>
            {patient.conditions.map((c, i) => (
              <View
                key={i}
                style={[
                  styles.conditionChip,
                  { backgroundColor: colors.tint + "15", borderColor: colors.tint + "30" },
                ]}
              >
                <Feather name="activity" size={12} color={colors.tint} />
                <Text style={[styles.conditionText, { color: colors.tint }]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Menu */}
      <View
        style={[styles.menuCard, { backgroundColor: colors.backgroundCard }]}
      >
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.7 },
              index < MENU_ITEMS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.menuLeft}>
              {item.arrow && (
                <Feather name="chevron-left" size={18} color={colors.textMuted} />
              )}
              {item.value && (
                <Text style={[styles.menuValue, { color: colors.textMuted }]}>
                  {item.value}
                </Text>
              )}
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: colors.tint + "15" },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={16}
                  color={colors.tint}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Member Since */}
      <Text style={[styles.memberSince, { color: colors.textMuted }]}>
        عضو منذ {patient.joinDate}
      </Text>

      {/* Logout */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          { borderColor: colors.danger + "40", opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="log-out" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>تسجيل الخروج</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  profilePhone: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  levelRow: {
    marginTop: 4,
  },
  progressCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  pointsCount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  progressLabels: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  progressHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  conditionsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  conditionChips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  conditionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  menuRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  menuValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  memberSince: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
