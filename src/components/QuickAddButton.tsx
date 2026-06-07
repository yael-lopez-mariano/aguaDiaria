import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { gradients } from '../constants/colors';
import { QuickAmountOption } from '../constants/water';

interface QuickAddButtonProps {
  option: QuickAmountOption;
  onPress: (amountMl: number) => void;
}

let nextFeedbackId = 0;

interface FeedbackBadge {
  id: number;
  anim: Animated.Value;
}

/**
 * Botón grande con degradado para registrar una cantidad de agua
 * predefinida. Al presionarlo "rebota" un poco y, además, hace flotar
 * un pequeño "+250 ml 💧" hacia arriba mientras se desvanece: una forma
 * sencilla y amigable de confirmar que el registro se guardó.
 */
export default function QuickAddButton({ option, onPress }: QuickAddButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [badges, setBadges] = useState<FeedbackBadge[]>([]);

  const animateTo = (value: number) => {
    Animated.spring(scaleAnim, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 12,
    }).start();
  };

  const handlePress = () => {
    const badge: FeedbackBadge = { id: nextFeedbackId++, anim: new Animated.Value(0) };
    setBadges((current) => [...current, badge]);

    Animated.timing(badge.anim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      setBadges((current) => current.filter((item) => item.id !== badge.id));
    });

    onPress(option.amountMl);
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPressIn={() => animateTo(0.93)}
        onPressOut={() => animateTo(1)}
        onPress={handlePress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
      >
        <LinearGradient
          colors={gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.emoji}>{option.emoji}</Text>
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.addLabel}>Toca para agregar</Text>
        </LinearGradient>
      </Pressable>

      {badges.map((badge) => {
        const translateY = badge.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });
        const opacity = badge.anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });

        return (
          <Animated.View
            key={badge.id}
            pointerEvents="none"
            style={[styles.feedback, { opacity, transform: [{ translateY }] }]}
          >
            <Text style={styles.feedbackText}>+{option.amountMl} ml 💧</Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '47%',
    marginBottom: 16,
  },
  button: {
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: gradients.button[1],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  emoji: {
    fontSize: 36,
  },
  label: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  feedback: {
    position: 'absolute',
    alignSelf: 'center',
    top: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: gradients.button[1],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '800',
    color: gradients.button[1],
  },
});
