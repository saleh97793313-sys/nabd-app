import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

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
      if ("requiresVerification" in result && result.requiresVerification) {
        router.replace({
          pathname: "/auth/verify",
          params: { email: result.email, name: result.name },
        });
      } else if (!result.success) {
        setError("error" in result ? result.error : "حدث خطأ أثناء التسجيل");
      }
    } catch {
      setError("خطأ في الاتصال، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = [styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }];
  const inputStyle = [styles.input, { color: colors.text }];

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
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>إنشاء حساب جديد</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.fields}>
            {/* الاسم */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>الاسم الكامل</Text>
              <View style={fieldStyle}>
                <TextInput
                  ref={nameRef}
                  style={inputStyle}
                  value={name}
                  onChangeText={setName}
                  placeholder="اسمك الكامل"
                  placeholderTextColor={colors.textMuted}
                  textAlign="right"
                  autoComplete="name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Feather name="user" size={18} color={colors.textMuted} style={styles.icon} />
              </View>
            </View>

            {/* البريد */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>البريد الإلكتروني</Text>
              <View style={fieldStyle}>
                <TextInput
                  ref={emailRef}
                  style={inputStyle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Feather name="mail" size={18} color={colors.textMuted} style={styles.icon} />
              </View>
            </View>

            {/* الهاتف */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>رقم الهاتف</Text>
              <View style={fieldStyle}>
                <TextInput
                  ref={phoneRef}
                  style={inputStyle}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+968 9X XX XXXX"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  textAlign="right"
                  autoComplete="tel"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Feather name="phone" size={18} color={colors.textMuted} style={styles.icon} />
              </View>
            </View>

            {/* كلمة السر */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>كلمة السر</Text>
              <View style={fieldStyle}>
                <TextInput
                  ref={passwordRef}
                  style={inputStyle}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="6 أحرف على الأقل"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                  autoComplete="new-password"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* تأكيد كلمة السر */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>تأكيد كلمة السر</Text>
              <View style={fieldStyle}>
                <TextInput
                  ref={confirmRef}
                  style={inputStyle}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="أعد كتابة كلمة السر"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <Feather name="lock" size={18} color={colors.textMuted} style={styles.icon} />
              </View>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FFF1F0" }]}>
              <Feather name="alert-circle" size={16} color="#FF4D4F" />
              <Text style={[styles.errorText, { color: "#FF4D4F" }]}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.infoBox, { backgroundColor: "#F0FDF8" }]}>
            <Feather name="mail" size={15} color="#00C896" />
            <Text style={[styles.infoText, { color: "#00C896" }]}>
              سنرسل رمز تحقق إلى بريدك لتفعيل الحساب
            </Text>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.registerBtn,
              { backgroundColor: colors.tint, opacity: pressed || loading ? 0.8 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>إنشاء الحساب</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>لديك حساب بالفعل؟ </Text>
          <Pressable onPress={() => router.replace("/auth/login")}>
            <Text style={[styles.footerLink, { color: colors.tint }]}>تسجيل الدخول</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  card: { borderRadius: 20, padding: 20, marginBottom: 16 },
  fields: { gap: 14, marginBottom: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  icon: { marginLeft: 8 },
  eyeBtn: { padding: 4, marginLeft: 4 },
  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  infoBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  registerBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  registerBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  footer: { flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", marginTop: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
