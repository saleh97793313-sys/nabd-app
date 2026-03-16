import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { verifyOtp, sendOtp } = useAppContext();

  const params = useLocalSearchParams<{ email: string; name: string }>();
  const email = params.email || "";
  const name = params.name || "";

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, OTP_LENGTH).split("");
      const newCode = [...code];
      digits.forEach((d, i) => { if (index + i < OTP_LENGTH) newCode[index + i] = d; });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      if (newCode.every((d) => d !== "")) {
        handleVerify(newCode.join(""));
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = cleaned;
    setCode(newCode);
    setError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      inputRefs.current[index]?.blur();
      if (newCode.every((d) => d !== "")) {
        handleVerify(newCode.join(""));
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const otp = fullCode || code.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("يرجى إدخال الرمز كاملاً");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        router.replace("/(tabs)/profile");
      } else {
        setError("error" in result ? result.error : "رمز غير صحيح");
        setCode(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await sendOtp(email);
      if (res.success) {
        setCountdown(RESEND_COOLDOWN);
        setCode(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(res.error || "فشل إعادة الإرسال");
      }
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="arrow-right" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: "#E8FBF4" }]}>
            <Feather name="mail" size={36} color="#00C896" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>تحقق من بريدك</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          أرسلنا رمز التحقق إلى
        </Text>
        <Text style={[styles.email, { color: colors.tint }]}>{maskedEmail}</Text>

        <View style={styles.otpRow}>
          {Array(OTP_LENGTH).fill(null).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.background,
                  borderColor: code[i] ? colors.tint : colors.border,
                  color: colors.text,
                  borderWidth: code[i] ? 2 : 1,
                },
              ]}
              value={code[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={2}
              textAlign="center"
              selectTextOnFocus
              caretHidden
            />
          ))}
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: "#FFF1F0" }]}>
            <Feather name="alert-circle" size={16} color="#FF4D4F" />
            <Text style={[styles.errorText, { color: "#FF4D4F" }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => handleVerify()}
          disabled={loading || code.some((d) => d === "")}
          style={({ pressed }) => [
            styles.verifyBtn,
            {
              backgroundColor: code.every((d) => d !== "") ? "#00C896" : colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>تفعيل الحساب</Text>
          )}
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={[styles.resendLabel, { color: colors.textSecondary }]}>
            لم تستلم الرمز؟{" "}
          </Text>
          <Pressable onPress={handleResend} disabled={countdown > 0 || resending}>
            {resending ? (
              <ActivityIndicator size="small" color={colors.tint} />
            ) : countdown > 0 ? (
              <Text style={[styles.resendTimer, { color: colors.textMuted }]}>
                إعادة الإرسال ({countdown}ث)
              </Text>
            ) : (
              <Text style={[styles.resendLink, { color: colors.tint }]}>إعادة الإرسال</Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.note, { color: colors.textMuted }]}>
          الرمز صالح لمدة 10 دقائق فقط
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconWrap: {
    marginBottom: 20,
    marginTop: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
    marginBottom: 32,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 12,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  verifyBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  resendRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  resendLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  resendTimer: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  note: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
