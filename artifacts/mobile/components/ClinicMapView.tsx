import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ClinicMapView(_props: any) {
  return (
    <View style={styles.container}>
      <Feather name="map" size={48} color="#999" />
      <Text style={styles.text}>الخريطة متاحة على التطبيق الأصلي فقط</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
