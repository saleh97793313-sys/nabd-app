import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const BRAND_GREEN = "#00C896";
const BRAND_NAVY = "#1A3A5C";

export function SplashLoader() {
  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Title after logo
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tagline after title
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loop on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots
    const dotAnimation = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(350),
        ])
      );

    dotAnimation(dot1, 0).start();
    dotAnimation(dot2, 200).start();
    dotAnimation(dot3, 400).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

          {/* Icon container */}
          <View style={styles.iconContainer}>
            {/* ECG/Heartbeat SVG-like using Views */}
            <HeartbeatIcon />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          نبض
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          منصة الولاء الصحي
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]}
            />
          ))}
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: taglineOpacity }]}>
        © 2026 نبض
      </Animated.Text>
    </View>
  );
}

function HeartbeatIcon() {
  return (
    <View style={styles.heartIcon}>
      {/* Simplified heartbeat line using boxes */}
      <View style={styles.ecgLine}>
        <View style={[styles.ecgSegment, { width: 8, height: 2 }]} />
        <View style={[styles.ecgSegment, { width: 2, height: 14, marginTop: -6 }]} />
        <View style={[styles.ecgSegment, { width: 2, height: 28, marginTop: -28 }]} />
        <View style={[styles.ecgSegment, { width: 2, height: 14, marginTop: -6 }]} />
        <View style={[styles.ecgSegment, { width: 10, height: 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bgCircle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: BRAND_GREEN,
    opacity: 0.05,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: BRAND_NAVY,
    opacity: 0.04,
    bottom: -60,
    left: -60,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  glowRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: BRAND_GREEN,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 26,
    backgroundColor: BRAND_GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  heartIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  ecgLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  ecgSegment: {
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  appName: {
    fontSize: 52,
    fontWeight: "800",
    color: BRAND_NAVY,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "400",
    color: "#64748B",
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_GREEN,
  },
  footer: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "400",
  },
});
