import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { DailySummary } from '../types/water';

interface DailySummaryCardProps {
  summary: DailySummary;
}

interface SummaryRowProps {
  emoji: string;
  label: string;
  value: string;
}

function SummaryRow({ emoji, label, value }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Tarjeta con el resumen del día: total, número de veces y momentos del día. */
export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de hoy 📋</Text>

      <SummaryRow
        emoji="💧"
        label="Total tomado"
        value={`${summary.totalMl} ml`}
      />
      <SummaryRow
        emoji="🔁"
        label="Veces que tomaste agua"
        value={`${summary.count}`}
      />
      <SummaryRow
        emoji="🌅"
        label="Tomaste agua en la mañana"
        value={summary.drankInMorning ? 'Sí ✅' : 'Aún no ❌'}
      />
      <SummaryRow
        emoji="🌙"
        label="Tomaste agua en la tarde/noche"
        value={summary.drankInAfternoonOrNight ? 'Sí ✅' : 'Aún no ❌'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowEmoji: {
    fontSize: 18,
    width: 30,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
