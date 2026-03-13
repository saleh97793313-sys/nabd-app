import { Feather } from "@expo/vector-icons";
import React from "react";
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
import { useAppContext, Appointment } from "@/context/AppContext";

const STATUS_CONFIG = {
  upcoming: { label: "قادم", color: "#00C896", bg: "#E6FBF5" },
  completed: { label: "مكتمل", color: "#4A6080", bg: "#F0F4F8" },
  cancelled: { label: "ملغى", color: "#FF4757", bg: "#FFF0F1" },
};

function AppointmentItem({
  appointment,
  colors,
}: {
  appointment: Appointment;
  colors: (typeof Colors)["light"];
}) {
  const status = STATUS_CONFIG[appointment.status];

  return (
    <View
      style={[
        styles.appointmentCard,
        { backgroundColor: colors.backgroundCard },
      ]}
    >
      {/* Status bar on left (RTL = right side visual) */}
      <View
        style={[styles.statusBar, { backgroundColor: status.color }]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View
            style={[styles.statusBadge, { backgroundColor: status.bg }]}
          >
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          {appointment.pointsEarned && (
            <View style={styles.pointsEarned}>
              <Feather name="star" size={12} color="#FFB800" />
              <Text style={styles.pointsEarnedText}>
                +{appointment.pointsEarned}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.clinicName, { color: colors.text }]}>
          {appointment.clinicName}
        </Text>
        <Text style={[styles.specialty, { color: colors.textSecondary }]}>
          {appointment.clinicSpecialty}
        </Text>

        {appointment.notes && (
          <Text style={[styles.notes, { color: colors.textMuted }]}>
            {appointment.notes}
          </Text>
        )}

        <View style={styles.dateTimeRow}>
          <View style={styles.dateItem}>
            <Feather name="clock" size={13} color={colors.textMuted} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {appointment.time}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Feather name="calendar" size={13} color={colors.textMuted} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {appointment.date}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { appointments } = useAppContext();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const past = appointments.filter((a) => a.status !== "upcoming");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          مواعيدي
        </Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          تتبع زياراتك واكسب النقاط
        </Text>
      </View>

      <FlatList
        data={[...upcoming, ...past]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 },
        ]}
        ListHeaderComponent={
          <>
            {upcoming.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                المواعيد القادمة
              </Text>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <>
            {item.status !== "upcoming" && index === upcoming.length && (
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, marginTop: 8 },
                ]}
              >
                السجل السابق
              </Text>
            )}
            <AppointmentItem appointment={item} colors={colors} />
          </>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد مواعيد بعد
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              احجز موعدك من العروض أو العيادات
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  appointmentCard: {
    borderRadius: 16,
    flexDirection: "row-reverse",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  pointsEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pointsEarnedText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFB800",
  },
  clinicName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  specialty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  notes: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    fontStyle: "italic",
  },
  dateTimeRow: {
    flexDirection: "row-reverse",
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  dateItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
