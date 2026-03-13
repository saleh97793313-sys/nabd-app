import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { register } = useAppContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا السر غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), phone.trim(), password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError(result.error || "حدث خطأ أثناء التسجيل");
      }
    } catch {
      setError("خطأ في الاتصال، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, value, onChange, placeholder, keyboardType = "default",
    secureTextEntry = false, showToggle = false, onToggle,
    autoComplete,
  }: any) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {showToggle && (
          <Pressable onPress={onToggle} style={styles.eyeBtn}>
            <Feather name={secureTextEntry ? "eye" : "eye-off"} size={18} color={colors.textMuted} />
          </Pressable>
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          textAlign="right"
          autoCapitalize="none"
          autoComplete={autoComplete}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleArea}>
          <Text style={[styles.title, { color: colors.text }]}>إنشاء حساب جديد</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            انضم إلى منصة الولاء الصحي واحصل على نقاط مع كل زيارة
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.fields}>
            <Field
              label="الاسم الكامل"
              value={name}
              onChange={setName}
              placeholder="محمد بن أحمد الراشدي"
              autoComplete="name"
            />
            <Field
              label="البريد الإلكتروني"
              value={email}
              onChange={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoComplete="email"
            />
            <Field
              label="رقم الهاتف"
              value={phone}
              onChange={setPhone}
              placeholder="+968 9XXX XXXX"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Field
              label="كلمة السر"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
            />
            <Field
              label="تأكيد كلمة السر"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + "15" }]}>
                <Feather name="alert-circle" size={14} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <View style={[styles.infoBox, { backgroundColor: colors.tint + "12" }]}>
              <Feather name="info" size={14} color={colors.tint} />
              <Text style={[styles.infoText, { color: colors.tint }]}>
                ستحصل على 100 نقطة ترحيبية عند التسجيل 🎉
              </Text>
            </View>

            <Pressable
              style={[styles.registerBtn, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>إنشاء الحساب</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            لديك حساب بالفعل؟{" "}
          </Text>
          <Pressable onPress={() => router.replace("/auth/login")}>
            <Text style={[styles.footerLink, { color: colors.tint }]}>تسجيل الدخول</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    padding: 8,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  titleArea: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  fields: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  eyeBtn: {
    padding: 4,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  infoBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  registerBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  registerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
