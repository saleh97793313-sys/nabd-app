import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext, Appointment } from "@/context/AppContext";

const STATUS_CONFIG = {
  upcoming: { label: "قادم", color: "#00C896", bg: "#E6FBF5" },
  completed: { label: "مكتمل", color: "#4A6080", bg: "#F0F4F8" },
  cancelled: { label: "ملغى", color: "#FF4757", bg: "#FFF0F1" },
};

function getApiBase(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (Platform.OS === "web") return "/api";
  if (domain) return `https://${domain}/api`;
  return "/api";
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={starStyles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} style={starStyles.starBtn}>
          <Feather
            name="star"
            size={36}
            color={star <= value ? "#FFB800" : "#D1D5DB"}
            style={star <= value ? { textShadowColor: "rgba(255,184,0,0.3)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 } : undefined}
          />
        </Pressable>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "center", gap: 8, marginVertical: 16 },
  starBtn: { padding: 4 },
});

function RatingModal({
  visible,
  appointment,
  onClose,
  onSubmitted,
  colors,
}: {
  visible: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSubmitted: () => void;
  colors: (typeof Colors)["light"];
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { patient } = useAppContext();

  useEffect(() => {
    if (visible) { setStars(0); setComment(""); }
  }, [visible]);

  const handleSubmit = async () => {
    if (stars === 0 || !appointment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPhone: patient.phone,
          clinicId: parseInt(appointment.clinicId),
          appointmentId: parseInt(appointment.id),
          stars,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        Alert.alert("خطأ", data.error || "حدث خطأ أثناء إرسال التقييم");
        return;
      }
      onSubmitted();
    } catch {
      Alert.alert("خطأ", "تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.backgroundCard }]}>
          <View style={modalStyles.header}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
            <Text style={[modalStyles.title, { color: colors.text }]}>قيّم زيارتك</Text>
          </View>

          {appointment && (
            <Text style={[modalStyles.clinicName, { color: colors.textSecondary }]}>
              {appointment.clinicName}
            </Text>
          )}

          <StarSelector value={stars} onChange={setStars} />

          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: "rgba(0,0,0,0.1)" }]}
            placeholder="اكتب تعليقك (اختياري)..."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlign="right"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={stars === 0 || submitting}
            style={[modalStyles.submitBtn, (stars === 0 || submitting) && { opacity: 0.5 }]}
          >
            <Text style={modalStyles.submitText}>
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  clinicName: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: "#00C896",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});

function RatePromptCard({
  appointment,
  onRate,
  colors,
}: {
  appointment: Appointment;
  onRate: (a: Appointment) => void;
  colors: (typeof Colors)["light"];
}) {
  return (
    <Pressable
      onPress={() => onRate(appointment)}
      style={[rateStyles.card, { backgroundColor: "#FFF8E1" }]}
    >
      <View style={rateStyles.row}>
        <View style={rateStyles.textCol}>
          <Text style={rateStyles.label}>قيّم زيارتك</Text>
          <Text style={[rateStyles.clinicText, { color: colors.textSecondary }]}>
            {appointment.clinicName} • {appointment.date}
          </Text>
        </View>
        <View style={rateStyles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Feather key={i} name="star" size={16} color="#FFB800" />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const rateStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.3)",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textCol: { flex: 1, gap: 4 },
  label: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#B8860B",
    textAlign: "right",
  },
  clinicText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  starsRow: { flexDirection: "row", gap: 2, marginLeft: 12 },
});

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
  const { appointments, patient, isGuest, bookingJustCompleted, clearBookingCompleted } = useAppContext();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [ratingAppointment, setRatingAppointment] = useState<Appointment | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    if (bookingJustCompleted) {
      const timer = setTimeout(() => clearBookingCompleted(), 4000);
      return () => clearTimeout(timer);
    }
  }, [bookingJustCompleted]);

  useEffect(() => {
    if (isGuest || !patient.phone) return;
    const completedAppointments = appointments.filter((a) => a.status === "completed");
    if (completedAppointments.length === 0) return;

    const checkRatings = async () => {
      const newRated = new Set<string>();
      for (const apt of completedAppointments) {
        try {
          const res = await fetch(`${getApiBase()}/ratings/check?appointmentId=${apt.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.rated) newRated.add(apt.id);
          }
        } catch {}
      }
      setRatedIds(newRated);
    };
    checkRatings();
  }, [appointments, isGuest, patient.phone]);

  const unratedCompleted = appointments.filter(
    (a) => a.status === "completed" && !ratedIds.has(a.id)
  );

  const handleRatingSubmitted = () => {
    if (ratingAppointment) {
      setRatedIds((prev) => new Set([...prev, ratingAppointment.id]));
    }
    setRatingAppointment(null);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

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

      {bookingJustCompleted && (
        <View style={thankYouStyles.container}>
          <Feather name="calendar" size={20} color="#00C896" />
          <Text style={thankYouStyles.text}>تم حجز موعدك بنجاح!</Text>
        </View>
      )}

      {showThankYou && (
        <View style={thankYouStyles.container}>
          <Feather name="check-circle" size={20} color="#00C896" />
          <Text style={thankYouStyles.text}>شكراً لتقييمك!</Text>
        </View>
      )}

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
            {unratedCompleted.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.sectionLabel, { color: "#B8860B", marginBottom: 8 }]}>
                  ⭐ قيّم زياراتك
                </Text>
                {unratedCompleted.map((apt) => (
                  <RatePromptCard
                    key={`rate-${apt.id}`}
                    appointment={apt}
                    onRate={setRatingAppointment}
                    colors={colors}
                  />
                ))}
              </View>
            )}
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

      <RatingModal
        visible={!!ratingAppointment}
        appointment={ratingAppointment}
        onClose={() => setRatingAppointment(null)}
        onSubmitted={handleRatingSubmitted}
        colors={colors}
      />
    </View>
  );
}

const thankYouStyles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#E6FBF5",
    borderRadius: 12,
  },
  text: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#00C896",
  },
});

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
