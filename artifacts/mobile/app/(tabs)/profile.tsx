import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

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
  { icon: "heart", label: "حالاتي الصحية", value: "", arrow: true, route: "" },
  { icon: "star", label: "سجل النقاط", value: "", arrow: true, route: "/points-history" },
  { icon: "shield", label: "التأمين الصحي", value: "", arrow: true, route: "" },
  { icon: "bell", label: "الإشعارات", value: "", arrow: true, route: "/notifications" },
  { icon: "help-circle", label: "المساعدة", value: "", arrow: true, route: "" },
  { icon: "info", label: "عن التطبيق", value: "1.0.0", arrow: false, route: "" },
];

function GuestProfile({ colors }: { colors: any }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 100 + bottomPadding,
        paddingTop: topPadding + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.guestHeader}>
        <View style={[styles.guestAvatarRing, { borderColor: colors.tint + "40" }]}>
          <View style={[styles.guestAvatar, { backgroundColor: colors.tint + "15" }]}>
            <Feather name="user" size={40} color={colors.tint} />
          </View>
        </View>
        <Text style={[styles.guestTitle, { color: colors.text }]}>أهلاً بك!</Text>
        <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
          سجّل دخولك للاستفادة من النقاط والعروض الحصرية
        </Text>
      </View>

      <View style={[styles.guestBenefitsCard, { backgroundColor: colors.backgroundCard }]}>
        <Text style={[styles.benefitsTitle, { color: colors.text }]}>مزايا التسجيل</Text>
        {[
          { icon: "award", text: "اجمع نقاط على كل زيارة", color: "#FFB800" },
          { icon: "tag", text: "احصل على خصومات حصرية", color: "#00C896" },
          { icon: "calendar", text: "احجز مواعيدك بسهولة", color: "#7C3AED" },
          { icon: "trending-up", text: "تتبع تاريخك الصحي", color: "#1A3A5C" },
        ].map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <View style={[styles.benefitIcon, { backgroundColor: b.color + "15" }]}>
              <Feather name={b.icon as any} size={18} color={b.color} />
            </View>
            <Text style={[styles.benefitText, { color: colors.text }]}>{b.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.loginMainBtn,
          { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push("/auth/login")}
      >
        <Feather name="log-in" size={20} color="#fff" />
        <Text style={styles.loginMainBtnText}>تسجيل الدخول</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.registerBtn,
          { borderColor: colors.tint, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={[styles.registerBtnText, { color: colors.tint }]}>إنشاء حساب جديد</Text>
      </Pressable>

      <View style={[styles.menuCard, { backgroundColor: colors.backgroundCard, marginTop: 24 }]}>
        {MENU_ITEMS.slice(3).map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.7 },
              index < MENU_ITEMS.slice(3).length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.menuLeft}>
              {item.arrow && <Feather name="chevron-left" size={18} color={colors.textMuted} />}
              {item.value && <Text style={[styles.menuValue, { color: colors.textMuted }]}>{item.value}</Text>}
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <View style={[styles.menuIcon, { backgroundColor: colors.tint + "15" }]}>
                <Feather name={item.icon as any} size={16} color={colors.tint} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function LoyaltyCard({ patient, colors, onQRPress }: { patient: any; colors: any; onQRPress: () => void }) {
  const levelConfig = LEVEL_CONFIG[patient.level];
  const gradientColors: Record<string, string[]> = {
    bronze: ["#CD7F32", "#A0522D"],
    silver: ["#A8A9AD", "#708090"],
    gold: ["#FFB800", "#DAA520"],
    platinum: ["#7C3AED", "#5B21B6"],
  };
  const [c1] = gradientColors[patient.level] || gradientColors.bronze;

  return (
    <View style={[styles.loyaltyCard, { backgroundColor: c1 }]}>
      <View style={styles.cardPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardBrand}>نبض</Text>
          <Text style={styles.cardLevelBadge}>{levelConfig.label}</Text>
        </View>

        <View style={styles.cardMiddle}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{patient.name}</Text>
            <Text style={styles.cardPhone}>{patient.phone}</Text>
            <View style={styles.cardPointsRow}>
              <Feather name="award" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardPoints}>{patient.points.toLocaleString()} نقطة</Text>
            </View>
          </View>

          <Pressable onPress={onQRPress} style={styles.cardQR}>
            <View style={styles.qrContainer}>
              <QRCode
                value={patient.phone || "nabd"}
                size={70}
                backgroundColor="white"
                color="#1A3A5C"
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.cardMember}>عضو منذ {patient.joinDate}</Text>
          <Text style={styles.cardFooter}>بطاقة الولاء الرقمية</Text>
        </View>
      </View>
    </View>
  );
}

function QRFullScreen({ phone, visible, onClose, colors }: { phone: string; visible: boolean; onClose: () => void; colors: any }) {
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <Pressable style={styles.qrOverlay} onPress={onClose}>
        <View style={styles.qrModal}>
          <Text style={styles.qrModalTitle}>رمز QR الخاص بك</Text>
          <View style={styles.qrModalContainer}>
            <QRCode value={phone || "nabd"} size={200} backgroundColor="white" color="#1A3A5C" />
          </View>
          <Text style={styles.qrModalPhone}>{phone}</Text>
          <Text style={styles.qrModalHint}>اعرض هذا الرمز عند الاستقبال</Text>
          <Pressable onPress={onClose} style={styles.qrCloseBtn}>
            <Text style={styles.qrCloseBtnText}>إغلاق</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { patient, logout, isGuest } = useAppContext();
  const [qrVisible, setQrVisible] = useState(false);

  if (isGuest) {
    return <GuestProfile colors={colors} />;
  }

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "خروج", style: "destructive", onPress: logout },
    ]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const levelConfig = LEVEL_CONFIG[patient.level];
  const progress = Math.min(
    (patient.points - levelConfig.current) / Math.max(levelConfig.next - levelConfig.current, 1),
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
        paddingBottom: 100 + bottomPadding,
        paddingTop: topPadding + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.tint }]}>{initials}</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{patient.name}</Text>
        <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{patient.phone}</Text>
        <View style={styles.levelRow}>
          <LevelBadge level={patient.level} size="medium" />
        </View>
      </View>

      <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>بطاقتي</Text>
        <LoyaltyCard patient={patient} colors={colors} onQRPress={() => setQrVisible(true)} />
      </View>

      <View style={[styles.progressCard, { backgroundColor: colors.backgroundCard }]}>
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

      {patient.conditions.length > 0 && (
        <View style={[styles.conditionsCard, { backgroundColor: colors.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>الحالات الصحية المتابعة</Text>
          <View style={styles.conditionChips}>
            {patient.conditions.map((c, i) => (
              <View
                key={i}
                style={[styles.conditionChip, { backgroundColor: colors.tint + "15", borderColor: colors.tint + "30" }]}
              >
                <Feather name="activity" size={12} color={colors.tint} />
                <Text style={[styles.conditionText, { color: colors.tint }]}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.menuCard, { backgroundColor: colors.backgroundCard }]}>
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => item.route ? router.push(item.route as any) : undefined}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.7 },
              index < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.menuLeft}>
              {item.arrow && <Feather name="chevron-left" size={18} color={colors.textMuted} />}
              {item.value && <Text style={[styles.menuValue, { color: colors.textMuted }]}>{item.value}</Text>}
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <View style={[styles.menuIcon, { backgroundColor: colors.tint + "15" }]}>
                <Feather name={item.icon as any} size={16} color={colors.tint} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.memberSince, { color: colors.textMuted }]}>
        عضو منذ {patient.joinDate}
      </Text>

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

      <QRFullScreen
        phone={patient.phone}
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        colors={colors}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  guestHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 10,
  },
  guestAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  guestTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  guestBenefitsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  loginMainBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#00C896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  loginMainBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  registerBtn: {
    marginHorizontal: 20,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  registerBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

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
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  profilePhone: { fontSize: 14, fontFamily: "Inter_400Regular" },
  levelRow: { marginTop: 4 },
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
  progressTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pointsCount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  progressLabels: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
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
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 12 },
  conditionChips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  conditionChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  conditionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
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
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  menuRight: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
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
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loyaltyCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 190,
  },
  cardPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  patternCircle1: { width: 200, height: 200, top: -60, left: -40 },
  patternCircle2: { width: 150, height: 150, bottom: -50, right: -30 },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBrand: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cardLevelBadge: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardMiddle: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "right",
  },
  cardPhone: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  cardPointsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  cardPoints: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.9)",
  },
  cardQR: { marginLeft: 16 },
  qrContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
  },
  cardBottom: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  cardMember: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  cardFooter: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    width: 300,
  },
  qrModalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A3A5C",
  },
  qrModalContainer: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#00C89630",
  },
  qrModalPhone: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A3A5C",
  },
  qrModalHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#666",
    textAlign: "center",
  },
  qrCloseBtn: {
    backgroundColor: "#00C896",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  qrCloseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
