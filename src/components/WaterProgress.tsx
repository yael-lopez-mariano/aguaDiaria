import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../constants/colors';

interface WaterProgressProps {
  totalMl: number;
  goalMl: number;
}

const TANK_HEIGHT = 150;

/**
 * Representa el progreso del día como un "tanque" que se va llenando
 * de agua. La altura del agua se anima cada vez que cambia el total,
 * dando una sensación agradable de "llenado" en vez de un salto brusco.
 *
 * El texto se muestra junto al tanque (no encima) para que siga siendo
 * legible incluso cuando el agua sube hasta arriba.
 */
export default function WaterProgress({ totalMl, goalMl }: WaterProgressProps) {
  const progress = Math.min(totalMl / goalMl, 1);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previousTotalRef = useRef(totalMl);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false, // animamos 'height', que no soporta el driver nativo
    }).start();
  }, [progress, fillAnim]);

  // Cada vez que el total sube (el usuario acaba de registrar agua), el
  // tanque da un pequeño "salto" de celebración antes de volver a su tamaño.
  useEffect(() => {
    if (totalMl > previousTotalRef.current) {
      pulseAnim.setValue(1);
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.08, useNativeDriver: true, speed: 40, bounciness: 14 }),
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
      ]).start();
    }
    previousTotalRef.current = totalMl;
  }, [totalMl, pulseAnim]);

  const animatedHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TANK_HEIGHT],
  });

  const litersText = `${(totalMl / 1000).toFixed(2)} L`;
  const percentText = `${Math.round(progress * 100)}% de tu meta`;
  const goalText = `Meta diaria: ${(goalMl / 1000).toFixed(1)} L`;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.tank, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={[styles.fillWrapper, { height: animatedHeight }]}>
          <LinearGradient
            colors={gradients.progress}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </Animated.View>

      <View style={styles.info}>
        <Text style={styles.dropEmoji}>💧</Text>
        <Text style={styles.totalText}>{litersText}</Text>
        <Text style={styles.percentText}>{percentText}</Text>
        <Text style={styles.goalText}>{goalText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 24,
  },
  tank: {
    width: 92,
    height: TANK_HEIGHT,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: colors.primaryLight,
    backgroundColor: colors.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fillWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  fill: {
    flex: 1,
    width: '100%',
  },
  info: {
    marginLeft: 20,
    flexShrink: 1,
  },
  dropEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  totalText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  percentText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  goalText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
