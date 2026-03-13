import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Patient } from "@/context/AppContext";

type Props = {
  patient: Patient;
  colors: any;
};

export function PointsCard({ patient, colors }: Props) {
  return (
    <View style={styles.card}>
      {/* Gradient-like background with tint color */}
      <View
        style={[
          styles.background,
          { backgroundColor: colors.tint },
        ]}
      />
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconWrapper}>
            <Feather name="award" size={20} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>نقاط الولاء الصحي</Text>
        </View>

        <Text style={styles.points}>
          {patient.points.toLocaleString()}
        </Text>
        <Text style={styles.pointsLabel}>نقطة متاحة</Text>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.stat}>
            <Feather name="activity" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>
              {patient.totalVisits} زيارة
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Feather name="calendar" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>
              عضو منذ {patient.joinDate.split("-")[0]}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    height: 180,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -60,
    left: -40,
  },
  decorCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -50,
    right: -30,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  points: {
    color: "#FFFFFF",
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    letterSpacing: -1,
    marginVertical: -4,
  },
  pointsLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  stat: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
