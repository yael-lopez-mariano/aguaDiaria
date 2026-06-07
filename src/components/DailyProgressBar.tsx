import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface DailyProgressBarProps {
  totalMl: number;
  goalMl: number;
}

/**
 * Barra de progreso horizontal que muestra qué tan cerca está el usuario
 * de su meta diaria. El relleno se anima suavemente cada vez que el
 * total cambia, igual que el tanque de la pantalla principal.
 */
export default function DailyProgressBar({ totalMl, goalMl }: DailyProgressBarProps) {
  const progress = Math.min(totalMl / goalMl, 1);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false, // animamos 'width', que no soporta el driver nativo
    }).start();
  }, [progress, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Progreso de hoy</Text>
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: animatedWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  track: {
    height: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
});
