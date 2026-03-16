import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const TEAL = "#05C4C2";
const NAVY_DARK = "#0A1628";
const NAVY = "#1A3A5C";

export function SplashLoader() {
  const { width: W, height: H } = useWindowDimensions();

  const LOGO = Math.round(W * 0.50);
  const RADIUS = Math.round(LOGO * 0.24);

  const pulseScale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-LOGO)).current;

  useEffect(() => {
    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.06, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Ripple 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(ring1Opacity, { toValue: 0.6, duration: 100, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(ring1Opacity, { toValue: 0, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring1Scale, { toValue: 2.0, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.delay(600),
      ])
    ).start();

    // Ripple 2 (offset)
    Animated.sequence([
      Animated.delay(750),
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0.45, duration: 100, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(ring2Opacity, { toValue: 0, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring2Scale, { toValue: 2.0, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.delay(600),
        ])
      ),
    ]).start();

    // Shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, { toValue: LOGO, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: -LOGO, duration: 0, useNativeDriver: true }),
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
            Animated.timing(dot, { toValue: -14, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
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
      {/* ── Logo area ── */}
      <View style={[styles.logoArea, { width: LOGO * 2, height: LOGO * 2 }]}>

        <Animated.View style={[
          styles.rippleRing,
          { width: LOGO, height: LOGO, borderRadius: RADIUS },
          { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
        ]} />

        <Animated.View style={[
          styles.rippleRing,
          { width: LOGO, height: LOGO, borderRadius: RADIUS },
          { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
        ]} />

        <Animated.View style={[
          styles.logoWrapper,
          { width: LOGO, height: LOGO, borderRadius: RADIUS },
          { transform: [{ scale: pulseScale }] },
        ]}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: LOGO, height: LOGO }}
            resizeMode="cover"
          />
          <Animated.View style={[
            styles.shimmer,
            { width: LOGO * 0.28 },
            { transform: [{ translateX: shimmerX }] },
          ]} />
        </Animated.View>
      </View>

      {/* ── Text ── */}
      <View style={styles.textBlock}>
        <Text style={[styles.appName, { fontSize: Math.round(W * 0.15) }]}>Ocure</Text>
        <View style={[styles.separator, { width: W * 0.14 }]} />
        <Text style={[styles.tagline, { fontSize: Math.round(W * 0.048) }]}>
          منصة الولاء الصحي
        </Text>
      </View>

      {/* ── Dots ── */}
      <Animated.View style={[styles.dotsRow, { marginTop: H * 0.06, opacity: dotsOpacity }]}>
        {[dot1Y, dot2Y, dot3Y].map((dotY, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: dotY }] }]} />
        ))}
      </Animated.View>

      {/* ── Footer ── */}
      <Text style={[styles.footer, { bottom: H * 0.05 }]}>© 2026 Ocure</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    // Absolute fill — covers the FULL SCREEN regardless of parent container
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  rippleRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: TEAL,
  },
  logoWrapper: {
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 24,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ skewX: "-20deg" }],
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  appName: {
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  separator: {
    height: 3,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  tagline: {
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
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
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
});
