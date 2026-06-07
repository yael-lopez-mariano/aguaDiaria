import React, { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailySummaryCard from '../components/DailySummaryCard';
import MotivationalMessage from '../components/MotivationalMessage';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import QuickAddGrid from '../components/QuickAddGrid';
import TodayHistoryList from '../components/TodayHistoryList';
import WaterProgress from '../components/WaterProgress';
import { colors } from '../constants/colors';
import { useWaterReminders } from '../hooks/useWaterReminders';
import { addWaterEntry, filterEntriesByDate, getAllEntries } from '../storage/waterStorage';
import { AppSettings } from '../types/settings';
import { WaterEntry } from '../types/water';
import { getTodayKey } from '../utils/date';
import { calculateDailySummary } from '../utils/waterSummary';

interface HomeScreenProps {
  dailyGoalMl: number;
  settings: AppSettings;
}

/**
 * Pantalla principal de AguaDiaria.
 *
 * Se encarga de:
 *  - cargar los registros guardados al abrir la app (y al volver de segundo plano,
 *    para detectar si ya empezó un nuevo día),
 *  - guardar un nuevo registro cuando el usuario toca un botón rápido,
 *  - calcular el resumen del día a partir de esos registros,
 *  - y, a través de `useWaterReminders`, mantener sincronizados los
 *    recordatorios de hidratación con ese resumen.
 *
 * La meta diaria (`dailyGoalMl`) viene de App, que la comparte con la
 * pantalla de Estadísticas para que ambas siempre vean el mismo valor.
 */
export default function HomeScreen({ dailyGoalMl, settings }: HomeScreenProps) {
  const [todayEntries, setTodayEntries] = useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodayEntries = useCallback(async () => {
    const allEntries = await getAllEntries();
    setTodayEntries(filterEntriesByDate(allEntries, getTodayKey()));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  // Si el usuario deja la app en segundo plano y la retoma al día siguiente,
  // necesitamos volver a leer los registros: "hoy" pudo haber cambiado.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        loadTodayEntries();
      }
    });
    return () => subscription.remove();
  }, [loadTodayEntries]);

  const handleAddWater = useCallback(async (amountMl: number) => {
    const allEntries = await addWaterEntry(amountMl);
    setTodayEntries(filterEntriesByDate(allEntries, getTodayKey()));
  }, []);

  const summary = calculateDailySummary(todayEntries);
  const { permissionStatus, requestPermission } = useWaterReminders(summary, settings, dailyGoalMl, !isLoading);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MotivationalMessage />

        {!isLoading && (
          <>
            <NotificationPermissionBanner status={permissionStatus} onRequestPermission={requestPermission} />
            <WaterProgress totalMl={summary.totalMl} goalMl={dailyGoalMl} />
            <QuickAddGrid onAdd={handleAddWater} />
            <DailySummaryCard summary={summary} />
            <TodayHistoryList entries={todayEntries} />
          </>
        )}
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
});
