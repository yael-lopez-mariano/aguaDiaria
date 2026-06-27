import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

function shiftTime(time: ReminderTime, deltaMinutes: number): ReminderTime {
  const totalMinutes = (time.hour * 60 + time.minute + deltaMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

function toTimeValue(time: ReminderTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

function parseTimeValue(val: string): ReminderTime | null {
  const [h, m] = val.split(':').map((s) => parseInt(s, 10));
  if (isNaN(h) || isNaN(m)) return null;
  return { hour: h % 24, minute: m % 60 };
}

/**
 * Fila para ajustar la hora de un recordatorio (mañana, tarde o noche).
 * En web muestra un selector de hora nativo del navegador (estilo reloj)
 * para elegir la hora de un clic. En móvil usa botones +/− de 1 minuto.
 */
export default function ReminderTimeRow({ emoji, label, time, disabled, onChangeTime }: ReminderTimeRowProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === 'web' ? (
        <View style={[styles.webPickerWrapper, disabled && styles.webPickerDisabled]}>
          <Text style={styles.webClockIcon}>🕐</Text>
          <TextInput
            value={toTimeValue(time)}
            onChangeText={(val) => {
              const parsed = parseTimeValue(val);
              if (parsed) onChangeTime(parsed);
            }}
            editable={!disabled}
            style={styles.webTimeInput}
            // Pasamos type="time" al DOM para activar el selector nativo del navegador
            {...({ type: 'time' } as object)}
          />
        </View>
      ) : (
        <>
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
        </>
      )}
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

  // ── Web: selector nativo del navegador ─────────────────────────────────────
  webPickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  webPickerDisabled: {
    borderColor: colors.tealLight,
  },
  webClockIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  webTimeInput: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.tealDark,
    minWidth: 80,
    // En web, TextInput ya no hereda el outline del navegador — sin borde extra
    outlineStyle: 'none',
  } as object,

  // ── Nativo: botones +/− ────────────────────────────────────────────────────
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
