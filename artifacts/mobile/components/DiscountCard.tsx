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
          opacity: discount.isUsed || isExpired ? 0.55 : 1,
        },
      ]}
    >
      {/* Left stripe + percent */}
      <View style={[styles.leftSection, { backgroundColor: discount.color }]}>
        <Text style={styles.percentText}>{discount.discountPercent}%</Text>
        <Text style={styles.offText}>خصم</Text>
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        <View style={styles.topRow}>
          <View style={styles.badges}>
            {discount.isUsed && (
              <View style={[styles.statusBadge, { backgroundColor: "#E8E8E8" }]}>
                <Text style={[styles.statusText, { color: "#999" }]}>مستخدم</Text>
              </View>
            )}
            {isExpired && !discount.isUsed && (
              <View style={[styles.statusBadge, { backgroundColor: "#FFE5E5" }]}>
                <Text style={[styles.statusText, { color: "#FF4757" }]}>منتهي</Text>
              </View>
            )}
            {isActive && (
              <View style={[styles.statusBadge, { backgroundColor: discount.color + "20" }]}>
                <Text style={[styles.statusText, { color: discount.color }]}>متاح</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {discount.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {discount.description}
        </Text>

        {discount.clinicName && (
          <View style={styles.clinicRow}>
            <Feather name="map-pin" size={11} color={colors.textMuted} />
            <Text style={[styles.clinicText, { color: colors.textMuted }]} numberOfLines={1}>
              {discount.clinicName}
            </Text>
          </View>
        )}

        <View style={styles.applicableRow}>
          <Feather name="check-circle" size={11} color={discount.color} />
          <Text style={[styles.applicableText, { color: colors.textSecondary }]} numberOfLines={1}>
            {discount.applicableTo}
          </Text>
        </View>

        {/* Dashed divider */}
        <View style={[styles.dashedLine, { borderColor: colors.border }]} />

        {/* Code + actions */}
        <View style={styles.codeRow}>
          <Pressable
            onPress={handleCopy}
            style={[styles.copyBtn, { backgroundColor: discount.color + "15" }]}
          >
            <Feather
              name={copied ? "check" : "copy"}
              size={13}
              color={discount.color}
            />
            <Text style={[styles.copyText, { color: discount.color }]}>
              {copied ? "تم النسخ" : "نسخ"}
            </Text>
          </Pressable>

          <View style={[styles.codeBox, { borderColor: discount.color + "40", backgroundColor: discount.color + "08" }]}>
            <Text style={[styles.codeText, { color: discount.color }]}>
              {discount.code}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.expiryText, { color: colors.textMuted }]}>
            ينتهي: {discount.expiryDate}
          </Text>
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
    borderRadius: 18,
    flexDirection: "row-reverse",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  leftSection: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  percentText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  offText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  mainContent: {
    flex: 1,
    padding: 14,
    gap: 5,
  },
  topRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  badges: {
    flexDirection: "row-reverse",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 18,
  },
  clinicRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  clinicText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
    textAlign: "right",
  },
  applicableRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  applicableText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  dashedLine: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    marginVertical: 4,
  },
  codeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  expiryText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  useBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  useBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
