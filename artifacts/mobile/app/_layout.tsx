import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppContextProvider, useAppContext } from "@/context/AppContext";
import { SplashLoader } from "@/components/SplashLoader";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const SPLASH_MIN_DURATION = 2500;

function AuthGate() {
  const { isAuthenticated, authLoading, enterAsGuest } = useAppContext();
  const segments = useSegments();
  const inAuthGroup = segments[0] === "auth";

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated && !inAuthGroup) {
      enterAsGuest();
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, authLoading, inAuthGroup]);

  if (authLoading) {
    return <SplashLoader />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="auth/register" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="offer/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="clinic/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="notifications" options={{ presentation: "card" }} />
      <Stack.Screen name="discounts" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const fontsReady = fontsLoaded || !!fontError;
  const ready = fontsReady && minTimeElapsed;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return <SplashLoader />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <AuthGate />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
