import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import type { Clinic } from "@/context/AppContext";

const OMAN_CENTER = { latitude: 23.588, longitude: 58.3829 };

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function openDirections(lat: number, lng: number, name: string) {
  const encodedName = encodeURIComponent(name);
  if (Platform.OS === "ios") {
    Linking.openURL(`maps:?daddr=${lat},${lng}&q=${encodedName}`);
  } else {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`
    );
  }
}

function ClinicCard({
  clinic,
  distance,
  colors,
}: {
  clinic: Clinic;
  distance: number | null;
  colors: typeof Colors.light;
}) {
  const hasLocation = clinic.latitude != null && clinic.longitude != null;

  return (
    <Pressable
      onPress={() => router.push(`/clinic/${clinic.id}`)}
      style={[styles.clinicCard, { backgroundColor: colors.backgroundCard }]}
    >
      <View style={styles.cardRow}>
        <View
          style={[styles.cardAvatar, { backgroundColor: colors.tint + "15" }]}
        >
          <Text style={[styles.cardAvatarText, { color: colors.tint }]}>
            {clinic.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text
            style={[styles.cardName, { color: colors.text }]}
            numberOfLines={1}
          >
            {clinic.name}
          </Text>
          <Text
            style={[styles.cardSpecialty, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {clinic.specialty}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.cardMetaItem}>
              <Feather name="map-pin" size={12} color={colors.textMuted} />
              <Text
                style={[styles.cardMetaText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {clinic.address}
              </Text>
            </View>
            {distance !== null && (
              <View style={styles.cardMetaItem}>
                <Feather name="navigation" size={12} color={colors.tint} />
                <Text style={[styles.cardDistance, { color: colors.tint }]}>
                  {distance < 1
                    ? `${Math.round(distance * 1000)} م`
                    : `${distance.toFixed(1)} كم`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <View
          style={[
            styles.ratingBadge,
            { backgroundColor: colors.accent + "15" },
          ]}
        >
          <Feather name="star" size={12} color={colors.accent} />
          <Text style={[styles.ratingText, { color: colors.accent }]}>
            {clinic.rating.toFixed(1)}
          </Text>
        </View>

        {hasLocation && (
          <Pressable
            onPress={() =>
              openDirections(clinic.latitude!, clinic.longitude!, clinic.name)
            }
            style={[styles.directionsBtn, { backgroundColor: colors.tint }]}
          >
            <Feather name="navigation" size={14} color="#fff" />
            <Text style={styles.directionsBtnText}>الاتجاهات</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { clinics, clinicsLoading } = useAppContext();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission("granted");
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } else {
          setLocationPermission("denied");
        }
      } catch {
        setLocationPermission("denied");
      }
    })();
  }, []);

  const clinicsWithLocation = clinics.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  const sortedClinics = [...clinics].sort((a, b) => {
    if (!userLocation) return 0;
    const distA =
      a.latitude != null && a.longitude != null
        ? getDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          )
        : Infinity;
    const distB =
      b.latitude != null && b.longitude != null
        ? getDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            b.latitude,
            b.longitude
          )
        : Infinity;
    return distA - distB;
  });

  const getDistance = (clinic: Clinic): number | null => {
    if (
      !userLocation ||
      clinic.latitude == null ||
      clinic.longitude == null
    )
      return null;
    return getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      clinic.latitude,
      clinic.longitude
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          العيادات القريبة
        </Text>
        {locationPermission === "granted" && userLocation && (
          <View style={styles.locationBadge}>
            <Feather name="navigation" size={12} color={colors.tint} />
            <Text style={[styles.locationText, { color: colors.tint }]}>
              تم تحديد موقعك
            </Text>
          </View>
        )}
      </View>

      {clinicsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            جاري تحميل العيادات...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
        >
          {locationPermission === "denied" && (
            <View
              style={[
                styles.permissionBanner,
                { backgroundColor: colors.accent + "15" },
              ]}
            >
              <Feather name="alert-circle" size={18} color={colors.accent} />
              <Text
                style={[styles.permissionText, { color: colors.textSecondary }]}
              >
                فعّل خدمة الموقع لعرض العيادات حسب القرب منك
              </Text>
            </View>
          )}

          {clinicsWithLocation.length > 0 && (
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: colors.tint + "15" },
                ]}
              >
                <Feather name="map-pin" size={14} color={colors.tint} />
                <Text style={[styles.statText, { color: colors.tint }]}>
                  {clinicsWithLocation.length} عيادة على الخريطة
                </Text>
              </View>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: colors.backgroundCard },
                ]}
              >
                <Feather name="list" size={14} color={colors.textMuted} />
                <Text style={[styles.statText, { color: colors.textMuted }]}>
                  {clinics.length} إجمالي
                </Text>
              </View>
            </View>
          )}

          {sortedClinics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="map" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                لا توجد عيادات مسجلة حالياً
              </Text>
            </View>
          ) : (
            sortedClinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                distance={getDistance(clinic)}
                colors={colors}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  locationBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  permissionBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  clinicCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAvatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  cardSpecialty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  cardMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  cardMetaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },
  cardDistance: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  cardActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  ratingBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  directionsBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  directionsBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
