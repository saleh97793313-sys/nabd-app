import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Discount } from "@/context/AppContext";

type Props = {
  discount: Discount;
  colors: any;
  canUse: boolean;
  onUse?: () => void;
};

export function DiscountCard({ discount, colors, canUse, onUse }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(discount.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    if (!canUse) {
      Alert.alert(
        "غير مؤهل",
        `هذا الخصم متاح لمستوى ${LEVEL_LABELS[discount.requiredLevel]} فما فوق`,
        [{ text: "حسناً" }]
      );
      return;
    }
    Alert.alert(
      "تأكيد الاستخدام",
      `أكد استخدام هذا الخصم في ${discount.clinicName ?? "العيادة"}.\nبعد التأكيد، أرِ الكود للموظف.`,
      [
        { text: "إلغاء", style: "cancel" },
        { text: "تأكيد", onPress: onUse },
      ]
    );
  };

  const isExpired = new Date(discount.expiryDate) < new Date();
  const isActive = !discount.isUsed && !isExpired && canUse;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundCard,
          opacity: discount.isUsed || isExpired ? 0.6 : 1,
        },
      ]}
    >
      {/* Left thick vertical section */}
      <View style={[styles.leftSection, { backgroundColor: discount.color }]}>
        <Text style={styles.percentText}>{discount.discountPercent}%</Text>
        <Text style={styles.offText}>خصم</Text>
      </View>

      {/* Dashed border simulator */}
      <View style={[styles.dashedDivider, { borderColor: colors.border }]} />

      {/* Main content */}
      <View style={styles.rightSection}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {discount.title}
          </Text>
          {discount.isUsed && (
            <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>مستخدم</Text>
            </View>
          )}
          {isExpired && !discount.isUsed && (
            <View style={[styles.statusBadge, { backgroundColor: colors.danger + "20" }]}>
              <Text style={[styles.statusText, { color: colors.danger }]}>منتهي</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {discount.description}
        </Text>

        <View style={styles.codeContainer}>
          <View style={[styles.codeBox, { borderColor: discount.color }]}>
            <Text style={[styles.codeText, { color: discount.color }]}>{discount.code}</Text>
          </View>
          <Pressable onPress={handleCopy} style={styles.copyBtn}>
            <Feather name={copied ? "check" : "copy"} size={16} color={discount.color} />
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.expiryContainer}>
            <Feather name="clock" size={12} color={colors.textMuted} />
            <Text style={[styles.expiryText, { color: colors.textMuted }]}>
              ينتهي: {discount.expiryDate}
            </Text>
          </View>
          
          {isActive && (
            <Pressable
              onPress={handleUse}
              style={[styles.useBtn, { backgroundColor: discount.color }]}
            >
              <Text style={styles.useBtnText}>استخدم الآن</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const LEVEL_LABELS: Record<string, string> = {
  bronze: "برونزي",
  silver: "فضي",
  gold: "ذهبي",
  platinum: "بلاتيني",
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    flexDirection: "row-reverse",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 120,
  },
  leftSection: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  percentText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  offText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  dashedDivider: {
    width: 1,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    marginVertical: 10,
  },
  rightSection: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  codeBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  codeText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  copyBtn: {
    padding: 8,
  },
  footerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expiryContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  useBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  useBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});