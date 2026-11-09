import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

interface BubbleConfig {
  left: DimensionValue;
  size: number;
  durationMs: number;
  delayMs: number;
  sway: number;
}

// Valores fijos (no aleatorios) para que las burbujas no "salten" de lugar
// cada vez que el componente se vuelve a renderizar.
const BUBBLES: BubbleConfig[] = [
  { left: '4%', size: 10, durationMs: 11000, delayMs: 0, sway: 8 },
  { left: '12%', size: 18, durationMs: 14000, delayMs: 2500, sway: 14 },
  { left: '21%', size: 7, durationMs: 9000, delayMs: 5200, sway: 6 },
  { left: '29%', size: 14, durationMs: 12500, delayMs: 1200, sway: 10 },
  { left: '37%', size: 22, durationMs: 16000, delayMs: 7000, sway: 16 },
  { left: '45%', size: 9, durationMs: 10000, delayMs: 3600, sway: 7 },
  { left: '53%', size: 12, durationMs: 11500, delayMs: 8400, sway: 9 },
  { left: '61%', size: 6, durationMs: 8500, delayMs: 600, sway: 5 },
  { left: '68%', size: 16, durationMs: 13500, delayMs: 4400, sway: 12 },
  { left: '76%', size: 8, durationMs: 9500, delayMs: 9800, sway: 6 },
  { left: '83%', size: 20, durationMs: 15000, delayMs: 2000, sway: 15 },
  { left: '90%', size: 11, durationMs: 10500, delayMs: 6200, sway: 8 },
  { left: '95%', size: 7, durationMs: 9000, delayMs: 3000, sway: 5 },
  { left: '17%', size: 5, durationMs: 8000, delayMs: 10500, sway: 4 },
  { left: '72%', size: 5, durationMs: 8000, delayMs: 11800, sway: 4 },
];

/** Una burbuja que sube desde el fondo de la pantalla balanceándose un poco. */
function Bubble({ left, size, durationMs, delayMs, sway, screenHeight }: BubbleConfig & { screenHeight: number }) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rise, {
        toValue: 1,
        duration: durationMs,
        delay: delayMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rise, durationMs, delayMs]);

  const translateY = rise.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(screenHeight + size * 2)],
  });
  const translateX = rise.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, sway, 0, -sway, 0],
  });
  const opacity = rise.interpolate({
    inputRange: [0, 0.08, 0.8, 1],
    outputRange: [0, 0.85, 0.6, 0],
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom: -size,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      <View
        style={[
          styles.bubbleShine,
          { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, top: size * 0.18, left: size * 0.2 },
        ]}
      />
    </Animated.View>
  );
}

/** Banda ondulada que se mueve lentamente de lado a lado, como la superficie del agua. */
function Wave({ top, color, durationMs, offset }: { top: DimensionValue; color: string; durationMs: number; offset: number }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: durationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: durationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, durationMs]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-offset, offset] });
  const translateY = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, 0] });

  return (
    <Animated.View
      style={[styles.wave, { top, backgroundColor: color, transform: [{ translateX }, { translateY }] }]}
    />
  );
}

/**
 * Fondo animado de toda la app: un degradado de agua clara, un par de
 * ondas suaves que se mecen y pequeñas burbujas que suben desde el fondo.
 * Va detrás de todas las pantallas y no recibe toques (`pointerEvents="none"`).
 */
export default function WaterBackground() {
  const { height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#EAFAF8', '#D6F4F7', '#BEE7F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Wave top="38%" color="rgba(127, 200, 255, 0.10)" durationMs={7000} offset={40} />
      <Wave top="62%" color="rgba(20, 184, 166, 0.08)" durationMs={9000} offset={60} />
      <Wave top="80%" color="rgba(47, 155, 255, 0.08)" durationMs={6000} offset={30} />
      {BUBBLES.map((bubble, index) => (
        <Bubble key={index} {...bubble} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(47, 155, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  bubbleShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  wave: {
    position: 'absolute',
    left: '-30%',
    width: '160%',
    height: 600,
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
});
