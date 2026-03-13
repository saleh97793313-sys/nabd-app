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
    <View style={[styles.card, { backgroundColor: colors.tint }]}>
      {/* Decorative elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      <Feather name="award" size={80} color="rgba(255,255,255,0.08)" style={styles.bgIcon} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.cardTitle}>نقاط الولاء الصحي</Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.points}>
            {patient.points.toLocaleString()}
          </Text>
          <Text style={styles.pointsLabel}>نقطة متاحة</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.stat}>
            <Text style={styles.statText}>
              {patient.totalVisits} زيارة
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
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
    borderRadius: 28,
    overflow: "hidden",
    minHeight: 180,
    padding: 28,
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -20,
    left: -20,
  },
  decorCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(26,58,92,0.15)", // Navy color simulate gradient
    bottom: -80,
    right: -50,
  },
  decorCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: 50,
    right: -40,
  },
  bgIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  cardTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  pointsContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 20,
  },
  points: {
    color: "#FFFFFF",
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    letterSpacing: -1,
    lineHeight: 56,
  },
  pointsLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  bottomRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  stat: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  statText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});
