import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import ClinicMapView from "@/components/ClinicMapView";
import { useAppContext } from "@/context/AppContext";
import type { Clinic } from "@/context/AppContext";

const OMAN_CENTER = { latitude: 23.588, longitude: 58.3829 };
const INITIAL_DELTA = { latitudeDelta: 0.15, longitudeDelta: 0.15 };

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
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    );
  }
}

function ClinicInfoCard({
  clinic,
  distance,
  colors,
  onClose,
}: {
  clinic: Clinic;
  distance: number | null;
  colors: typeof Colors.light;
  onClose: () => void;
}) {
  const hasLocation = clinic.latitude != null && clinic.longitude != null;

  return (
    <View style={[styles.infoCard, { backgroundColor: colors.backgroundCard }]}>
      <Pressable onPress={onClose} style={styles.infoCardClose}>
        <Feather name="x" size={18} color={colors.textMuted} />
      </Pressable>

      <Pressable
        onPress={() => router.push(`/clinic/${clinic.id}`)}
        style={styles.infoCardContent}
      >
        <View style={styles.infoCardRow}>
          <View
            style={[
              styles.infoCardAvatar,
              { backgroundColor: colors.tint + "15" },
            ]}
          >
            <Text style={[styles.infoCardAvatarText, { color: colors.tint }]}>
              {clinic.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.infoCardDetails}>
            <Text
              style={[styles.infoCardName, { color: colors.text }]}
              numberOfLines={1}
            >
              {clinic.name}
            </Text>
            <Text
              style={[styles.infoCardSpecialty, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {clinic.specialty}
            </Text>
            <View style={styles.infoCardMeta}>
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
              {distance !== null && (
                <Text style={[styles.distanceText, { color: colors.tint }]}>
                  {distance < 1
                    ? `${Math.round(distance * 1000)} م`
                    : `${distance.toFixed(1)} كم`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.infoCardActions}>
        <Pressable
          onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
          style={[styles.actionBtn, { backgroundColor: colors.tint + "15" }]}
        >
          <Feather name="phone" size={16} color={colors.tint} />
          <Text style={[styles.actionBtnText, { color: colors.tint }]}>
            اتصال
          </Text>
        </Pressable>
        {hasLocation && (
          <Pressable
            onPress={() =>
              openDirections(clinic.latitude!, clinic.longitude!, clinic.name)
            }
            style={[styles.actionBtn, { backgroundColor: colors.tint }]}
          >
            <Feather name="navigation" size={16} color="#fff" />
            <Text style={[styles.actionBtnTextWhite]}>الاتجاهات</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ClinicListCard({
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
      style={[styles.listCard, { backgroundColor: colors.backgroundCard }]}
    >
      <View style={styles.listCardRow}>
        <View
          style={[
            styles.infoCardAvatar,
            { backgroundColor: colors.tint + "15" },
          ]}
        >
          <Text style={[styles.infoCardAvatarText, { color: colors.tint }]}>
            {clinic.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.listCardInfo}>
          <Text
            style={[styles.infoCardName, { color: colors.text }]}
            numberOfLines={1}
          >
            {clinic.name}
          </Text>
          <Text
            style={[styles.infoCardSpecialty, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {clinic.specialty}
          </Text>
          <View style={styles.infoCardMeta}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color={colors.textMuted} />
              <Text
                style={[styles.metaText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {clinic.address}
              </Text>
            </View>
            {distance !== null && (
              <Text style={[styles.distanceText, { color: colors.tint }]}>
                {distance < 1
                  ? `${Math.round(distance * 1000)} م`
                  : `${distance.toFixed(1)} كم`}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.listCardRight}>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: colors.accent + "15" },
            ]}
          >
            <Feather name="star" size={11} color={colors.accent} />
            <Text style={[styles.ratingText, { color: colors.accent }]}>
              {clinic.rating.toFixed(1)}
            </Text>
          </View>
          {hasLocation && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                openDirections(
                  clinic.latitude!,
                  clinic.longitude!,
                  clinic.name
                );
              }}
              style={[styles.dirBtn, { backgroundColor: colors.tint }]}
            >
              <Feather name="navigation" size={12} color="#fff" />
            </Pressable>
          )}
        </View>
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
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

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

  const activeClinics = clinics.filter(
    (c) => c.verified && c.latitude != null && c.longitude != null
  );

  const allActiveClinics = clinics.filter((c) => c.verified);

  const getDistance = (clinic: Clinic): number | null => {
    if (!userLocation || clinic.latitude == null || clinic.longitude == null)
      return null;
    return getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      clinic.latitude,
      clinic.longitude
    );
  };

  const sortedClinics = [...allActiveClinics].sort((a, b) => {
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

  const mapCenter = userLocation ?? OMAN_CENTER;

  if (clinicsLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          جاري تحميل العيادات...
        </Text>
      </View>
    );
  }

  if (Platform.OS !== "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ClinicMapView
          clinics={activeClinics.map((c) => ({
            id: String(c.id),
            name: c.name,
            specialty: c.specialty,
            latitude: c.latitude!,
            longitude: c.longitude!,
          }))}
          initialRegion={{
            ...mapCenter,
            ...INITIAL_DELTA,
          }}
          showsUserLocation={locationPermission === "granted"}
          onMarkerPress={(clinicId: string) => {
            const found = clinics.find((c) => String(c.id) === clinicId);
            if (found) setSelectedClinic(found);
          }}
          tintColor={colors.tint}
        />

        {selectedClinic && (
          <View style={styles.infoCardContainer}>
            <ClinicInfoCard
              clinic={selectedClinic}
              distance={getDistance(selectedClinic)}
              colors={colors}
              onClose={() => setSelectedClinic(null)}
            />
          </View>
        )}

        <View
          style={[
            styles.mapHeader,
            { paddingTop: topPad + 8, backgroundColor: "transparent" },
          ]}
        >
          <View
            style={[
              styles.mapTitleBadge,
              { backgroundColor: colors.backgroundCard },
            ]}
          >
            <Feather name="map-pin" size={16} color={colors.tint} />
            <Text style={[styles.mapTitleText, { color: colors.text }]}>
              {activeClinics.length} عيادة
            </Text>
          </View>
        </View>
      </View>
    );
  }

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

        {activeClinics.length > 0 && (
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statBadge,
                { backgroundColor: colors.tint + "15" },
              ]}
            >
              <Feather name="map-pin" size={14} color={colors.tint} />
              <Text style={[styles.statText, { color: colors.tint }]}>
                {activeClinics.length} عيادة على الخريطة
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
            <ClinicListCard
              key={clinic.id}
              clinic={clinic}
              distance={getDistance(clinic)}
              colors={colors}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  mapHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  mapTitleBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapTitleText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  infoCardContainer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoCardClose: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 1,
    padding: 4,
  },
  infoCardContent: {},
  infoCardRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  infoCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardAvatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  infoCardDetails: {
    flex: 1,
    gap: 2,
  },
  infoCardName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  infoCardSpecialty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  infoCardMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  distanceText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  infoCardActions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  actionBtnTextWhite: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
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
  listCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  listCardRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  listCardInfo: {
    flex: 1,
    gap: 2,
  },
  listCardRight: {
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },
  dirBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
