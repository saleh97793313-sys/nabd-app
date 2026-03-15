import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
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
import { OfferCard } from "@/components/OfferCard";
import { BookingModal } from "@/components/BookingModal";

export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { clinics, offers, bookAppointment, isGuest } = useAppContext();
  const [showBooking, setShowBooking] = useState(false);

  const clinic = clinics.find((c) => c.id === id);
  if (!clinic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Feather name="loader" size={24} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontFamily: "Inter_400Regular" }}>جارٍ التحميل...</Text>
      </View>
    );
  }

  const clinicOffers = offers.filter((o) => o.clinicId === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const initials = clinic.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const pointsPerVisit = clinic.pointsPerVisit || 100;

  const handleBookPress = () => {
    if (isGuest) {
      router.push("/auth/login");
      return;
    }
    setShowBooking(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.backgroundCard }]}
        >
          <Feather name="chevron-right" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          العيادة
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100 + bottomPad,
        }}
      >
        <View style={styles.clinicHero}>
          <View style={[styles.heroAvatar, { backgroundColor: colors.tint + "15" }]}>
            <Text style={[styles.heroAvatarText, { color: colors.tint }]}>
              {initials}
            </Text>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.clinicName, { color: colors.text }]}>
                {clinic.name}
              </Text>
              {clinic.verified && (
                <Feather name="check-circle" size={18} color={colors.tint} />
              )}
            </View>
            <Text style={[styles.specialty, { color: colors.textSecondary }]}>
              {clinic.specialty}
            </Text>
          </View>

          <View style={styles.heroStats}>
            <View style={[styles.ratingBig, { backgroundColor: colors.accent + "15" }]}>
              <Feather name="star" size={16} color={colors.accent} />
              <Text style={[styles.ratingNumber, { color: colors.accent }]}>
                {clinic.rating}
              </Text>
            </View>
            <Text style={[styles.ratingLabel, { color: colors.textMuted }]}>
              {clinic.totalPatients.toLocaleString()}+ مريض
            </Text>
          </View>
        </View>

        {clinic.descriptionAr && (
          <View style={[styles.descCard, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.descText, { color: colors.textSecondary }]}>
              {clinic.descriptionAr}
            </Text>
          </View>
        )}

        {clinic.openHours && (
          <View style={[styles.infoRow, { backgroundColor: colors.backgroundCard }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.tint + "15" }]}>
              <Feather name="clock" size={16} color={colors.tint} />
            </View>
            <Text style={[styles.infoText, { color: colors.text }]}>{clinic.openHours}</Text>
          </View>
        )}

        <View
          style={[styles.contactCard, { backgroundColor: colors.backgroundCard }]}
        >
          <Pressable
            style={styles.contactItem}
            onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
          >
            <Feather name="phone" size={18} color={colors.tint} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              {clinic.phone}
            </Text>
          </Pressable>
          <View style={[styles.contactDivider, { backgroundColor: colors.border }]} />
          <View style={styles.contactItem}>
            <Feather name="map-pin" size={18} color={colors.tint} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              {clinic.address}
            </Text>
          </View>
        </View>

        {clinic.latitude != null && clinic.longitude != null && (
          <Pressable
            onPress={() => {
              const url = Platform.OS === "ios"
                ? `maps:?daddr=${clinic.latitude},${clinic.longitude}&q=${encodeURIComponent(clinic.name)}`
                : `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
              Linking.openURL(url);
            }}
            style={[styles.mapCard, { backgroundColor: colors.backgroundCard }]}
          >
            <View style={styles.mapCardContent}>
              <View style={[styles.mapIconContainer, { backgroundColor: colors.tint + "15" }]}>
                <Feather name="map" size={24} color={colors.tint} />
              </View>
              <View style={styles.mapCardText}>
                <Text style={[styles.mapCardTitle, { color: colors.text }]}>
                  عرض على خرائط جوجل
                </Text>
                <Text style={[styles.mapCardSubtitle, { color: colors.textMuted }]}>
                  اضغط للحصول على الاتجاهات
                </Text>
              </View>
              <View style={[styles.mapCardArrow, { backgroundColor: colors.tint }]}>
                <Feather name="navigation" size={16} color="#fff" />
              </View>
            </View>
          </Pressable>
        )}

        {clinicOffers.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              عروض هذه العيادة
            </Text>
            {clinicOffers.map((offer) => (
              <View key={offer.id} style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                <OfferCard
                  offer={offer}
                  colors={colors}
                  onPress={() => router.push(`/offer/${offer.id}`)}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.backgroundCard, paddingBottom: bottomPad + 12 }]}>
        <View style={styles.bottomBarInner}>
          <View style={styles.bottomInfo}>
            <View style={[styles.pointsChip, { backgroundColor: "#FFB800" + "15" }]}>
              <Feather name="award" size={14} color="#FFB800" />
              <Text style={styles.pointsChipText}>{pointsPerVisit} نقطة</Text>
            </View>
            <Text style={[styles.bottomLabel, { color: colors.textMuted }]}>لكل زيارة</Text>
          </View>
          <Pressable
            style={[styles.bookBtn, { backgroundColor: colors.tint }]}
            onPress={handleBookPress}
          >
            <Feather name="calendar" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>احجز موعد</Text>
          </Pressable>
        </View>
      </View>

      <BookingModal
        visible={showBooking}
        clinic={clinic}
        colors={colors}
        pointsPerVisit={pointsPerVisit}
        onClose={(wasSuccess) => {
          setShowBooking(false);
          if (wasSuccess) {
            router.replace("/(tabs)/appointments");
          }
        }}
        onBook={(details) => bookAppointment(clinic.id, details)}
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
  clinicHero: {
    padding: 20,
    gap: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  heroAvatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  heroInfo: {
    gap: 4,
    alignItems: "flex-end",
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  clinicName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  specialty: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  heroStats: {
    alignItems: "flex-end",
    gap: 6,
  },
  ratingBig: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingNumber: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  ratingLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  descCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  descText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 22,
  },
  infoRow: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  contactCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    flex: 1,
  },
  contactDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  mapCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mapCardContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  mapCardText: {
    flex: 1,
    gap: 2,
  },
  mapCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  mapCardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  mapCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  bottomBar: {
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
  bottomBarInner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomInfo: {
    alignItems: "flex-end",
    gap: 4,
  },
  pointsChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pointsChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#B8860B",
  },
  bottomLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  bookBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
