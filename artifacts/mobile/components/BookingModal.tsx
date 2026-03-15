import { Feather } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import type { Clinic } from "@/context/AppContext";

type ThemeColors = typeof Colors.light;

const SPECIALTY_SERVICES: Record<string, { en: string; ar: string }[]> = {
  "General Medicine": [
    { en: "General Checkup", ar: "فحص عام" },
    { en: "Consultation", ar: "استشارة طبية" },
    { en: "Blood Test", ar: "تحليل دم" },
    { en: "Follow-up", ar: "متابعة" },
  ],
  "Dentistry": [
    { en: "Teeth Cleaning", ar: "تنظيف الأسنان" },
    { en: "Filling", ar: "حشو" },
    { en: "Teeth Whitening", ar: "تبييض الأسنان" },
    { en: "Extraction", ar: "خلع" },
    { en: "Consultation", ar: "استشارة" },
  ],
  "Physiotherapy": [
    { en: "Physiotherapy Session", ar: "جلسة علاج طبيعي" },
    { en: "Rehabilitation", ar: "إعادة تأهيل" },
    { en: "Assessment", ar: "تقييم" },
    { en: "Sports Injury", ar: "إصابة رياضية" },
  ],
  "Ophthalmology": [
    { en: "Eye Exam", ar: "فحص عيون" },
    { en: "Vision Test", ar: "فحص نظر" },
    { en: "Laser Consultation", ar: "استشارة ليزر" },
    { en: "Follow-up", ar: "متابعة" },
  ],
  "Family Medicine": [
    { en: "Family Consultation", ar: "استشارة عائلية" },
    { en: "Vaccination", ar: "تطعيم" },
    { en: "General Checkup", ar: "فحص عام" },
    { en: "Child Checkup", ar: "فحص أطفال" },
  ],
};

const DEFAULT_SERVICES = [
  { en: "Consultation", ar: "استشارة طبية" },
  { en: "Checkup", ar: "فحص عام" },
  { en: "Follow-up", ar: "متابعة" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00", "19:30", "20:00",
];

const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function getNextDays(count: number): { date: Date; label: string; dayName: string; dateStr: string }[] {
  const days: { date: Date; label: string; dayName: string; dateStr: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = AR_DAYS[d.getDay()];
    const label = `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({ date: d, label, dayName, dateStr });
  }
  return days;
}

type BookingModalProps = {
  visible: boolean;
  clinic: Clinic;
  colors: ThemeColors;
  pointsPerVisit: number;
  onClose: () => void;
  onBook: (details: {
    service: string;
    serviceAr: string;
    date: string;
    time: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function BookingModal({ visible, clinic, colors, pointsPerVisit, onClose, onBook }: BookingModalProps) {
  const specialtyKey = clinic.specialtyEn || clinic.specialty;
  const services = SPECIALTY_SERVICES[specialtyKey] || DEFAULT_SERVICES;
  const nextDays = useMemo(() => getNextDays(7), []);

  const [selectedService, setSelectedService] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  const resetForm = () => {
    setSelectedService(0);
    setSelectedDate(0);
    setSelectedTime(null);
    setNotes("");
    setStep("form");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert("تنبيه", "يرجى اختيار وقت الموعد");
      return;
    }
    setLoading(true);
    try {
      const svc = services[selectedService];
      const day = nextDays[selectedDate];
      const result = await onBook({
        service: svc.en,
        serviceAr: svc.ar,
        date: day.dateStr,
        time: selectedTime,
        notes: notes.trim() || undefined,
      });
      if (result.success) {
        setStep("success");
      } else {
        Alert.alert("خطأ", result.error || "فشل في حجز الموعد");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={bStyles.overlay}>
        <View style={[bStyles.sheet, { backgroundColor: colors.backgroundCard }]}>
          <View style={bStyles.handle} />

          {step === "success" ? (
            <View style={bStyles.successContainer}>
              <View style={[bStyles.successIcon, { backgroundColor: "#00C896" + "15" }]}>
                <Feather name="check-circle" size={48} color="#00C896" />
              </View>
              <Text style={[bStyles.successTitle, { color: colors.text }]}>تم حجز موعدك بنجاح!</Text>
              <Text style={[bStyles.successSub, { color: colors.textSecondary }]}>
                {services[selectedService].ar} - {nextDays[selectedDate].label}
              </Text>
              <View style={[bStyles.pointsBadgeLarge, { backgroundColor: "#FFB800" + "15" }]}>
                <Feather name="award" size={20} color="#FFB800" />
                <Text style={[bStyles.pointsTextLarge, { color: "#FFB800" }]}>
                  ستكسب {pointsPerVisit} نقطة عند إتمام الزيارة
                </Text>
              </View>
              <Pressable style={[bStyles.doneBtn, { backgroundColor: colors.tint }]} onPress={handleClose}>
                <Text style={bStyles.doneBtnText}>تم</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={bStyles.header}>
                <Pressable onPress={handleClose} hitSlop={12}>
                  <Feather name="x" size={22} color={colors.textSecondary} />
                </Pressable>
                <Text style={[bStyles.title, { color: colors.text }]}>احجز موعد</Text>
              </View>

              <Text style={[bStyles.clinicLabel, { color: colors.textSecondary }]}>
                {clinic.name}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={[bStyles.sectionLabel, { color: colors.text }]}>الخدمة</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bStyles.pillRow}>
                  {services.map((svc, i) => {
                    const active = selectedService === i;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => setSelectedService(i)}
                        style={[
                          bStyles.pill,
                          { borderColor: active ? colors.tint : colors.border },
                          active && { backgroundColor: colors.tint + "12" },
                        ]}
                      >
                        <Text style={[bStyles.pillText, { color: active ? colors.tint : colors.textSecondary }]}>
                          {svc.ar}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={[bStyles.sectionLabel, { color: colors.text }]}>التاريخ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bStyles.dateRow}>
                  {nextDays.map((day, i) => {
                    const active = selectedDate === i;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => setSelectedDate(i)}
                        style={[
                          bStyles.dateCard,
                          { borderColor: active ? colors.tint : colors.border, backgroundColor: active ? colors.tint : colors.background },
                        ]}
                      >
                        <Text style={[bStyles.dateDayName, { color: active ? "#fff" : colors.textSecondary }]}>
                          {day.dayName}
                        </Text>
                        <Text style={[bStyles.dateLabel, { color: active ? "#fff" : colors.text }]}>
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={[bStyles.sectionLabel, { color: colors.text }]}>الوقت</Text>
                <View style={bStyles.timeGrid}>
                  {TIME_SLOTS.map((t) => {
                    const active = selectedTime === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setSelectedTime(t)}
                        style={[
                          bStyles.timeSlot,
                          { borderColor: active ? colors.tint : colors.border, backgroundColor: active ? colors.tint : colors.background },
                        ]}
                      >
                        <Text style={[bStyles.timeText, { color: active ? "#fff" : colors.text }]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[bStyles.sectionLabel, { color: colors.text }]}>ملاحظات (اختياري)</Text>
                <TextInput
                  style={[bStyles.notesInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="أضف ملاحظاتك هنا..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />

                <View style={[bStyles.pointsBadge, { backgroundColor: "#FFB800" + "12" }]}>
                  <Feather name="award" size={16} color="#FFB800" />
                  <Text style={[bStyles.pointsText, { color: "#B8860B" }]}>
                    ستكسب {pointsPerVisit} نقطة عند إتمام الزيارة
                  </Text>
                </View>

                <Pressable
                  style={[bStyles.bookBtn, { backgroundColor: colors.tint, opacity: loading || !selectedTime ? 0.6 : 1 }]}
                  onPress={handleBook}
                  disabled={loading || !selectedTime}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="calendar" size={18} color="#fff" />
                      <Text style={bStyles.bookBtnText}>تأكيد الحجز</Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const bStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "85%",
    ...Platform.select({
      web: { maxHeight: "90%" },
      default: {},
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  clinicLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    marginBottom: 10,
    marginTop: 16,
  },
  pillRow: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  dateRow: {
    flexDirection: "row-reverse",
    gap: 10,
    paddingVertical: 2,
  },
  dateCard: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 80,
  },
  dateDayName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  timeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 70,
    alignItems: "center",
  },
  timeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  notesInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 70,
    textAlignVertical: "top",
  },
  pointsBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  pointsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  bookBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
    marginTop: 16,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    textAlign: "center",
  },
  pointsBadgeLarge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    width: "100%",
  },
  pointsTextLarge: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "right",
  },
  doneBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  doneBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
