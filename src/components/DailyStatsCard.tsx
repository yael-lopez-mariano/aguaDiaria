import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { DailySummary } from '../types/water';
import { getHydrationStatusMessage } from '../utils/waterSummary';
import DailyProgressBar from './DailyProgressBar';

interface DailyStatsCardProps {
  summary: DailySummary;
  goalMl: number;
}

interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * Tarjeta principal de Estadísticas: resume el día de hoy con el total
 * tomado, el número de registros, el porcentaje de la meta alcanzado,
 * una barra de progreso y un mensaje de ánimo según qué tan bien va.
 */
export default function DailyStatsCard({ summary, goalMl }: DailyStatsCardProps) {
  const percentOfGoal = Math.round((summary.totalMl / goalMl) * 100);
  const statusMessage = getHydrationStatusMessage(percentOfGoal);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu día hasta ahora 💧</Text>

      <View style={styles.statsRow}>
        <Stat value={`${summary.totalMl} ml`} label="Total tomado" />
        <Stat value={`${summary.count}`} label="Registros" />
        <Stat value={`${percentOfGoal}%`} label="De tu meta" />
      </View>

      <DailyProgressBar totalMl={summary.totalMl} goalMl={goalMl} />

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{statusMessage}</Text>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
