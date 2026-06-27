import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { ReminderTime } from '../types/settings';
import { formatHourMinute } from '../utils/date';
import TimePickerModal from './TimePickerModal';

interface ReminderTimeRowProps {
  emoji: string;
  label: string;
  time: ReminderTime;
  disabled: boolean;
  onChangeTime: (time: ReminderTime) => void;
}

/**
 * Fila de recordatorio con un badge de hora tappable que abre un modal
 * de tipo "carrete" para elegir la hora con scroll. Funciona igual en
 * móvil y en web sin necesidad de escribir a mano.
 */
export default function ReminderTimeRow({
  emoji,
  label,
  time,
  disabled,
  onChangeTime,
}: ReminderTimeRowProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={[styles.row, disabled && styles.rowDisabled]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>

        <Pressable
          style={[styles.badge, disabled && styles.badgeDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={styles.badgeText}>{formatHourMinute(time.hour, time.minute)}</Text>
          <Text style={styles.badgeIcon}>✏️</Text>
        </Pressable>
      </View>

      <TimePickerModal
        visible={modalVisible}
        time={time}
        onConfirm={(newTime) => {
          onChangeTime(newTime);
          setModalVisible(false);
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    marginRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeDisabled: {
    borderColor: colors.tealLight,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.tealDark,
  },
  badgeIcon: {
    fontSize: 12,
  },
});
