import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { AppSettings, ReminderMoment, ReminderTime } from '../types/settings';
import ReminderTimeRow from './ReminderTimeRow';

interface RemindersSettingsCardProps {
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
}

const MOMENTS: { moment: ReminderMoment; emoji: string; label: string }[] = [
  { moment: 'morning', emoji: '🌅', label: 'Mañana' },
  { moment: 'afternoon', emoji: '☀️', label: 'Tarde' },
  { moment: 'night', emoji: '🌙', label: 'Noche' },
];

/**
 * Tarjeta de recordatorios: un interruptor para activar o desactivar las
 * notificaciones por completo, y tres filas para ajustar a qué hora debe
 * sonar cada una (mañana, tarde, noche). Cada cambio se guarda de inmediato
 * y, gracias a `useWaterReminders`, vuelve a sincronizar lo programado.
 */
export default function RemindersSettingsCard({ settings, onChangeSettings }: RemindersSettingsCardProps) {
  const toggleNotifications = (enabled: boolean) => {
    onChangeSettings({ ...settings, notificationsEnabled: enabled });
  };

  const updateReminderTime = (moment: ReminderMoment, time: ReminderTime) => {
    onChangeSettings({
      ...settings,
      reminderTimes: { ...settings.reminderTimes, [moment]: time },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Recordatorios 🔔</Text>
          <Text style={styles.subtitle}>Avisos para tomar agua durante el día.</Text>
        </View>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: colors.border, true: colors.tealLight }}
          thumbColor={settings.notificationsEnabled ? colors.teal : colors.card}
        />
      </View>

      {MOMENTS.map(({ moment, emoji, label }) => (
        <ReminderTimeRow
          key={moment}
          emoji={emoji}
          label={label}
          time={settings.reminderTimes[moment]}
          disabled={!settings.notificationsEnabled}
          onChangeTime={(time) => updateReminderTime(moment, time)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
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
});
