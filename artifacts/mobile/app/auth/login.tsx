import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { login } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRef = useRef<TextInput>(null);

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة السر");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace("/(tabs)/profile");
      } else if ("requiresVerification" in result && result.requiresVerification) {
        router.replace({
          pathname: "/auth/verify",
          params: { email: result.email, name: result.name },
        });
      } else {
        setError("error" in result ? result.error : "بيانات الدخول غير صحيحة");
      }
    } catch {
      setError("خطأ في الاتصال، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

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
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.logoArea}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.tint }]}>نبض</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            منصة الولاء الصحي
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
          <Text style={[styles.title, { color: colors.text }]}>تسجيل الدخول</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            أدخل بياناتك للمتابعة
          </Text>

          <View style={styles.fields}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>البريد الإلكتروني</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                  autoComplete="email"
                  returnKeyType="next"
                  autoFocus
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>كلمة السر</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FFF1F0" }]}>
              <Feather name="alert-circle" size={16} color="#FF4D4F" />
              <Text style={[styles.errorText, { color: "#FF4D4F" }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: colors.tint, opacity: pressed || loading ? 0.8 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>دخول</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>ليس لديك حساب؟ </Text>
          <Pressable onPress={() => router.push("/auth/register")}>
            <Text style={[styles.footerLink, { color: colors.tint }]}>إنشاء حساب</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  logoArea: { alignItems: "center", marginVertical: 20 },
  logo: { width: 72, height: 72, borderRadius: 16, marginBottom: 8 },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold" },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  card: { borderRadius: 20, padding: 20, marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginBottom: 20 },
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
  inputIcon: { marginLeft: 8 },
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
  loginBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  footer: { flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", marginTop: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
  closeBtn: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});
