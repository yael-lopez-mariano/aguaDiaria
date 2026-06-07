import React, { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailyStatsCard from '../components/DailyStatsCard';
import GoalSettingCard from '../components/GoalSettingCard';
import TodayHistoryList from '../components/TodayHistoryList';
import WeeklyStatsCard from '../components/WeeklyStatsCard';
import { colors } from '../constants/colors';
import { filterEntriesByDate, getAllEntries } from '../storage/waterStorage';
import { WaterEntry } from '../types/water';
import { getTodayKey } from '../utils/date';
import { calculateDailySummary, calculateWeeklySummary } from '../utils/waterSummary';

interface StatsScreenProps {
  dailyGoalMl: number;
  onChangeGoal: (newGoalMl: number) => void;
}

/**
 * Pantalla de Estadísticas: muestra cómo va el usuario hoy, cómo le fue
 * durante la semana, lo deja ajustar su meta diaria y repasar sus
 * registros recientes. Carga sus propios datos (igual que HomeScreen)
 * para mantenerse simple e independiente; ambas pantallas comparten la
 * misma meta diaria a través de los props que vienen de App.
 */
export default function StatsScreen({ dailyGoalMl, onChangeGoal }: StatsScreenProps) {
  const [allEntries, setAllEntries] = useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const entries = await getAllEntries();
    setAllEntries(entries);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Igual que en HomeScreen: si el usuario vuelve a la app otro día,
  // necesitamos releer los registros para que "hoy" y "esta semana" se
  // recalculen con la fecha correcta.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        loadEntries();
      }
    });
    return () => subscription.remove();
  }, [loadEntries]);

  const todayEntries = filterEntriesByDate(allEntries, getTodayKey());
  const dailySummary = calculateDailySummary(todayEntries);
  const weeklySummary = calculateWeeklySummary(allEntries, dailyGoalMl);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Estadísticas 📊</Text>
          <Text style={styles.subtitle}>Así va tu equilibrio de hidratación</Text>
        </View>

        {!isLoading && (
          <>
            <DailyStatsCard summary={dailySummary} goalMl={dailyGoalMl} />
            <GoalSettingCard goalMl={dailyGoalMl} onChangeGoal={onChangeGoal} />
            <WeeklyStatsCard weeklySummary={weeklySummary} goalMl={dailyGoalMl} />
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
