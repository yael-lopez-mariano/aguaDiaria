import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface FloatingDropConfig {
  emoji: string;
  size: number;
  top: number;
  left: number;
  delayMs: number;
  durationMs: number;
  travel: number;
}

const DROPS: FloatingDropConfig[] = [
  { emoji: '💧', size: 36, top: 4, left: 70, delayMs: 0, durationMs: 2600, travel: 10 },
  { emoji: '🫧', size: 22, top: 52, left: 14, delayMs: 350, durationMs: 2200, travel: 8 },
  { emoji: '🫧', size: 16, top: 12, left: 18, delayMs: 700, durationMs: 2000, travel: 7 },
  { emoji: '💧', size: 24, top: 58, left: 92, delayMs: 200, durationMs: 2400, travel: 9 },
  { emoji: '🫧', size: 14, top: 0, left: 110, delayMs: 550, durationMs: 1900, travel: 6 },
];

/**
 * Pequeña ilustración decorativa: gotas y burbujas que flotan suavemente
 * de arriba a abajo, en bucle, dándole vida a la tarjeta principal sin
 * necesitar ninguna imagen externa (funciona igual en celular y en web).
 */
function FloatingDrop({ emoji, size, top, left, delayMs, durationMs, travel }: FloatingDropConfig) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: durationMs,
          delay: delayMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, durationMs, delayMs]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -travel],
  });

  return (
    <Animated.Text
      style={[
        styles.drop,
        { fontSize: size, top, left, transform: [{ translateY }] },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

/** Conjunto de gotas y burbujas flotantes que arman la ilustración decorativa. */
export default function WaterDropsIllustration() {
  return (
    <View style={styles.container} pointerEvents="none">
      {DROPS.map((drop, index) => (
        <FloatingDrop key={index} {...drop} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 80,
  },
  drop: {
    position: 'absolute',
  },
});
