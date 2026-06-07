import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DangerZoneCard from '../components/DangerZoneCard';
import GoalPresetSelector from '../components/GoalPresetSelector';
import RemindersSettingsCard from '../components/RemindersSettingsCard';
import { colors } from '../constants/colors';
import { AppSettings } from '../types/settings';

interface SettingsScreenProps {
  dailyGoalMl: number;
  onChangeGoal: (newGoalMl: number) => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  onClearAllData: () => void;
}

/**
 * Pantalla de Configuración: agrupa todo lo que el usuario puede
 * personalizar (meta diaria, recordatorios y sus horarios) y la opción
 * de borrar todos sus datos guardados. No carga datos por su cuenta:
 * recibe todo desde App, que es quien guarda y comparte estos valores
 * con el resto de la app.
 */
export default function SettingsScreen({
  dailyGoalMl,
  onChangeGoal,
  settings,
  onChangeSettings,
  onClearAllData,
}: SettingsScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Configuración ⚙️</Text>
          <Text style={styles.subtitle}>Ajusta AguaDiaria a tu manera</Text>
        </View>

        <GoalPresetSelector goalMl={dailyGoalMl} onChangeGoal={onChangeGoal} />
        <RemindersSettingsCard settings={settings} onChangeSettings={onChangeSettings} />
        <DangerZoneCard onConfirmClear={onClearAllData} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
