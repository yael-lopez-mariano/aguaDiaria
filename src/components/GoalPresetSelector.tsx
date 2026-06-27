import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface GoalPresetSelectorProps {
  goalMl: number;
  onChangeGoal: (newGoalMl: number) => void;
}

const PRESETS_ML = [1500, 2000, 2500];
const STEP_ML = 250;
const MIN_GOAL_ML = 500;
const MAX_GOAL_ML = 5000;

function formatLiters(ml: number): string {
  const liters = ml / 1000;
  return `${liters % 1 === 0 ? liters.toFixed(1) : liters.toFixed(2)} L`;
}

/**
 * Selector de meta diaria: ofrece tres metas comunes (1.5 L, 2 L, 2.5 L)
 * para elegir con un toque, y un ajuste fino con +/- de 250 ml para
 * quien prefiera una meta personalizada (se marca como "Personalizada"
 * cuando el valor no coincide con ninguno de los preestablecidos).
 */
export default function GoalPresetSelector({ goalMl, onChangeGoal }: GoalPresetSelectorProps) {
  const isCustom = !PRESETS_ML.includes(goalMl);
  const canDecrease = goalMl > MIN_GOAL_ML;
  const canIncrease = goalMl < MAX_GOAL_ML;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meta diaria 🎯</Text>
      <Text style={styles.subtitle}>Elige una meta rápida o ajústala a tu gusto.</Text>

      <View style={styles.presetRow}>
        {PRESETS_ML.map((preset) => {
          const isSelected = goalMl === preset;
          return (
            <Pressable
              key={preset}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              onPress={() => onChangeGoal(preset)}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                {formatLiters(preset)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.customRow}>
        <Pressable
          style={[styles.stepButton, !canDecrease && styles.stepButtonDisabled]}
          onPress={() => onChangeGoal(Math.max(goalMl - STEP_ML, MIN_GOAL_ML))}
          disabled={!canDecrease}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>

        <View style={styles.customLabel}>
          <Text style={styles.customValue}>{formatLiters(goalMl)}</Text>
          {isCustom && <Text style={styles.customBadge}>Personalizada</Text>}
        </View>

        <Pressable
          style={[styles.stepButton, !canIncrease && styles.stepButtonDisabled]}
          onPress={() => onChangeGoal(Math.min(goalMl + STEP_ML, MAX_GOAL_ML))}
          disabled={!canIncrease}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  presetChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  presetChipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  presetText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetTextSelected: {
    color: colors.textOnPrimary,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    backgroundColor: colors.tealLight,
  },
  stepButtonText: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  customLabel: {
    alignItems: 'center',
    marginHorizontal: 18,
    minWidth: 96,
  },
  customValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  customBadge: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
});
