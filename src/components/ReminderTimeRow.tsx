import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { ReminderTime } from '../types/settings';
import { formatHourMinute } from '../utils/date';

interface ReminderTimeRowProps {
  emoji: string;
  label: string;
  time: ReminderTime;
  disabled: boolean;
  onChangeTime: (time: ReminderTime) => void;
}

const STEP_MINUTES = 1;
const MINUTES_PER_DAY = 24 * 60;

/** Suma (o resta) minutos a una hora del día, dando la vuelta a la medianoche. */
function shiftTime(time: ReminderTime, deltaMinutes: number): ReminderTime {
  const totalMinutes = (time.hour * 60 + time.minute + deltaMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

/**
 * Fila para ajustar la hora de un recordatorio (mañana, tarde o noche)
 * en pasos de 15 minutos, con botones +/-. Se muestra atenuada y sin
 * funcionar cuando las notificaciones están apagadas.
 */
export default function ReminderTimeRow({ emoji, label, time, disabled, onChangeTime }: ReminderTimeRowProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[styles.stepButton, disabled && styles.stepButtonDisabled]}
        onPress={() => onChangeTime(shiftTime(time, -STEP_MINUTES))}
        disabled={disabled}
        hitSlop={6}
      >
        <Text style={styles.stepButtonText}>−</Text>
      </Pressable>

      <Text style={styles.timeText}>{formatHourMinute(time.hour, time.minute)}</Text>

      <Pressable
        style={[styles.stepButton, disabled && styles.stepButtonDisabled]}
        onPress={() => onChangeTime(shiftTime(time, STEP_MINUTES))}
        disabled={disabled}
        hitSlop={6}
      >
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  emoji: {
    fontSize: 18,
    width: 30,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    backgroundColor: colors.tealLight,
  },
  stepButtonText: {
    color: colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 19,
  },
  timeText: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
});
