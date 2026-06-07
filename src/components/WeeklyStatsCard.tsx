import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { WeeklySummary } from '../types/water';
import { formatWeekdayLabel } from '../utils/date';

interface WeeklyStatsCardProps {
  weeklySummary: WeeklySummary;
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

const CHART_HEIGHT = 70;

/**
 * Tarjeta con el resumen de los últimos 7 días: total de la semana,
 * promedio diario, cuántos días se cumplió la meta y cuántos se tomó
 * poca agua, además de una mini gráfica de barras para ver el patrón
 * de un vistazo (verde = se cumplió la meta ese día).
 */
export default function WeeklyStatsCard({ weeklySummary, goalMl }: WeeklyStatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu semana 📅</Text>

      <View style={styles.statsRow}>
        <Stat value={`${(weeklySummary.totalMl / 1000).toFixed(2)} L`} label="Total de la semana" />
        <Stat value={`${(weeklySummary.averageMl / 1000).toFixed(2)} L`} label="Promedio diario" />
      </View>
      <View style={styles.statsRow}>
        <Stat value={`${weeklySummary.daysMetGoal} 🎯`} label="Días que cumpliste tu meta" />
        <Stat value={`${weeklySummary.daysLowWater} ⚠️`} label="Días con poca agua" />
      </View>

      <View style={styles.chart}>
        {weeklySummary.days.map((day) => {
          const ratio = Math.min(day.totalMl / goalMl, 1);
          const barHeight = day.totalMl > 0 ? Math.max(ratio * CHART_HEIGHT, 4) : 0;
          const metGoal = day.totalMl >= goalMl;

          return (
            <View key={day.dateKey} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight, backgroundColor: metGoal ? colors.success : colors.primary },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{formatWeekdayLabel(day.dateKey)}</Text>
            </View>
          );
        })}
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: CHART_HEIGHT,
    width: 18,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
