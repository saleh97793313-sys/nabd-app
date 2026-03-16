import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const TEAL = "#05C4C2";
const NAVY_DARK = "#0A1628";
const NAVY = "#1A3A5C";

// Responsive sizes based on screen width
const LOGO_SIZE = Math.round(W * 0.48);
const RING_SIZE = Math.round(W * 0.48);
const LOGO_RADIUS = Math.round(LOGO_SIZE * 0.26);

export function SplashLoader() {
  const pulseScale = useRef(new Animated.Value(1)).current;

  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;

  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  const shimmerX = useRef(new Animated.Value(-LOGO_SIZE)).current;

  useEffect(() => {
    // Gentle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ripple ring 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(ring1Opacity, { toValue: 0.6, duration: 100, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(ring1Opacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 2.0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600),
      ])
    ).start();

    // Ripple ring 2 (offset)
    Animated.sequence([
      Animated.delay(800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0.45, duration: 100, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 1400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 2.0,
              duration: 1400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(600),
        ])
      ),
    ]).start();

    // Shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: LOGO_SIZE,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, { toValue: -LOGO_SIZE, duration: 0, useNativeDriver: true }),
        Animated.delay(3000),
      ])
    ).start();

    // Dots
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const bounceDot = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.delay(900 + delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -14,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ])
        ),
      ]).start();
    };
    bounceDot(dot1Y, 0);
    bounceDot(dot2Y, 180);
    bounceDot(dot3Y, 360);
  }, []);

  return (
    <LinearGradient
      colors={[NAVY_DARK, NAVY]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      {/* Top spacer */}
      <View style={{ flex: 1 }} />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <Animated.View
          style={[
            styles.rippleRing,
            { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.rippleRing,
            { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
          ]}
        />

        <Animated.View
          style={[styles.logoWrapper, { transform: [{ scale: pulseScale }] }]}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
          />
        </Animated.View>
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={styles.appName}>Ocure</Text>
        <View style={styles.separator} />
        <Text style={styles.tagline}>منصة الولاء الصحي</Text>
      </View>

      {/* Bottom spacer + dots */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: H * 0.12 }}>
        <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
          {[dot1Y, dot2Y, dot3Y].map((dotY, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: dotY }] }]}
            />
          ))}
        </Animated.View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>© 2026 Ocure</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  logoArea: {
    width: LOGO_SIZE * 2,
    height: LOGO_SIZE * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rippleRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: LOGO_RADIUS,
    borderWidth: 2,
    borderColor: TEAL,
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_RADIUS,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 24,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: LOGO_SIZE * 0.3,
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ skewX: "-20deg" }],
  },
  textBlock: {
    alignItems: "center",
    gap: 14,
    marginTop: 10,
  },
  appName: {
    fontSize: Math.round(W * 0.16),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  separator: {
    width: W * 0.13,
    height: 3,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  tagline: {
    fontSize: Math.round(W * 0.05),
    fontWeight: "400",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: TEAL,
  },
  footer: {
    position: "absolute",
    bottom: H * 0.05,
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
});
