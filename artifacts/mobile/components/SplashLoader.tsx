import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

const TEAL = "#05C4C2";
const NAVY_DARK = "#0A1628";
const NAVY = "#1A3A5C";

export function SplashLoader() {
  // Everything starts VISIBLE (matching the static splash) — no entrance flicker
  const pulseScale = useRef(new Animated.Value(1)).current;

  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;

  const titleOpacity = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(1)).current;

  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  const shimmerX = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    // --- Pulse loop (starts immediately) ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.07,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // --- Ripple ring 1 ---
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Opacity, {
            toValue: 0.55,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring1Opacity, {
            toValue: 0,
            duration: 1300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1.7,
            duration: 1300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ])
    ).start();

    // --- Ripple ring 2 (staggered) ---
    Animated.sequence([
      Animated.delay(700),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring2Opacity, {
              toValue: 0.4,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 1300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 1.7,
              duration: 1300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(500),
        ])
      ),
    ]).start();

    // --- Shimmer sweep across logo ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: 160,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: -160,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(2800),
      ])
    ).start();

    // --- Dots appear after 400ms then bounce ---
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const bounceDot = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.delay(800 + delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -11,
              duration: 280,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 280,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(450),
          ])
        ),
      ]).start();
    };
    bounceDot(dot1Y, 0);
    bounceDot(dot2Y, 160);
    bounceDot(dot3Y, 320);
  }, []);

  return (
    <LinearGradient
      colors={[NAVY_DARK, NAVY]}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <View style={styles.content}>

        {/* Logo + Ripple rings */}
        <View style={styles.logoArea}>

          {/* Ripple ring 1 */}
          <Animated.View
            style={[styles.rippleRing, {
              opacity: ring1Opacity,
              transform: [{ scale: ring1Scale }],
            }]}
          />
          {/* Ripple ring 2 */}
          <Animated.View
            style={[styles.rippleRing, {
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            }]}
          />

          {/* Logo — starts fully visible, no entrance animation */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { transform: [{ scale: pulseScale }] },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
            {/* Shimmer sweep */}
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerX }] },
              ]}
            />
          </Animated.View>
        </View>

        {/* App Name — starts fully visible */}
        <Animated.Text style={[styles.appName, { opacity: titleOpacity }]}>
          Ocure
        </Animated.Text>

        {/* Teal separator */}
        <View style={styles.separator} />

        {/* Tagline — starts fully visible */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          منصة الولاء الصحي
        </Animated.Text>

        {/* Loading dots */}
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
      <Animated.Text style={[styles.footer, { opacity: taglineOpacity }]}>
        © 2026 Ocure
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 18,
  },
  logoArea: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rippleRing: {
    position: "absolute",
    width: 165,
    height: 165,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: TEAL,
  },
  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 36,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 50,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ skewX: "-20deg" }],
  },
  appName: {
    fontSize: 54,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  separator: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: TEAL,
    marginTop: -6,
    marginBottom: -2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: TEAL,
  },
  footer: {
    position: "absolute",
    bottom: 52,
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
});
