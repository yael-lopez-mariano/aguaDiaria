import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface GoalSettingCardProps {
  goalMl: number;
  onChangeGoal: (newGoalMl: number) => void;
}

const STEP_ML = 250;
const MIN_GOAL_ML = 500;
const MAX_GOAL_ML = 5000;

/**
 * Tarjeta que deja al usuario ajustar su meta diaria de hidratación en
 * pasos de 250 ml, dentro de un rango razonable (0.5 L a 5 L). El cambio
 * se guarda de inmediato en AsyncStorage, sin necesidad de un botón aparte.
 */
export default function GoalSettingCard({ goalMl, onChangeGoal }: GoalSettingCardProps) {
  const canDecrease = goalMl > MIN_GOAL_ML;
  const canIncrease = goalMl < MAX_GOAL_ML;

  const decrease = () => {
    if (canDecrease) onChangeGoal(Math.max(goalMl - STEP_ML, MIN_GOAL_ML));
  };

  const increase = () => {
    if (canIncrease) onChangeGoal(Math.min(goalMl + STEP_ML, MAX_GOAL_ML));
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Meta diaria 🎯</Text>
        <Text style={styles.subtitle}>Ajusta cuánta agua quieres tomar cada día.</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.button, !canDecrease && styles.buttonDisabled]}
          onPress={decrease}
          disabled={!canDecrease}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>

        <Text style={styles.goalText}>{(goalMl / 1000).toFixed(2)} L</Text>

        <Pressable
          style={[styles.button, !canIncrease && styles.buttonDisabled]}
          onPress={increase}
          disabled={!canIncrease}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  goalText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 64,
    textAlign: 'center',
  },
});
