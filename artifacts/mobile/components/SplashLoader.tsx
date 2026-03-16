import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TEAL = "#05C4C2";
const NAVY_DARK = "#0A1628";
const NAVY = "#1A3A5C";

export function SplashLoader() {
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.6)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;

  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  const shimmerX = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    // --- Logo entrance (spring bounce) ---
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // --- Pulse loop after entrance ---
    Animated.sequence([
      Animated.delay(800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.07,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // --- Ripple ring 1 ---
    const ripple = (opacityAnim: Animated.Value, scaleAnim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.5,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(600),
        ])
      );
    };

    setTimeout(() => {
      ripple(ring1Opacity, ring1Scale, 0);
      ripple(ring2Opacity, ring2Scale, 700);
      ring1Opacity.setValue(0);
      ring1Scale.setValue(0.6);
      ring2Opacity.setValue(0);
      ring2Scale.setValue(0.6);

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring1Opacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
            Animated.timing(ring1Scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ring1Opacity, { toValue: 0, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring1Scale, { toValue: 1.5, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.delay(600),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(ring2Opacity, { toValue: 0.4, duration: 200, useNativeDriver: true }),
              Animated.timing(ring2Scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(ring2Opacity, { toValue: 0, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
              Animated.timing(ring2Scale, { toValue: 1.5, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            ]),
            Animated.delay(600),
          ])
        ).start();
      }, 700);
    }, 500);

    // --- Title slides in ---
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // --- Tagline fades in ---
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(taglineY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // --- Dots appear and bounce ---
    Animated.sequence([
      Animated.delay(1100),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const bounceDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay + 1100),
          Animated.timing(dot, {
            toValue: -10,
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
          Animated.delay(400),
        ])
      ).start();
    };
    bounceDot(dot1Y, 0);
    bounceDot(dot2Y, 150);
    bounceDot(dot3Y, 300);

    // --- Shimmer sweep on logo ---
    Animated.sequence([
      Animated.delay(900),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerX, {
            toValue: 160,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerX, {
            toValue: -160,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(2200),
        ])
      ),
    ]).start();
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

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseScale) },
                ],
              },
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

        {/* App Name */}
        <Animated.Text
          style={[
            styles.appName,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Ocure
        </Animated.Text>

        {/* Separator */}
        <Animated.View style={[styles.separator, { opacity: titleOpacity }]} />

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
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
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rippleRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 44,
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
