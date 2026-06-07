import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { WaterEntry } from '../types/water';

interface TodayHistoryListProps {
  entries: WaterEntry[];
}

/**
 * Lista de los registros de hoy, del más reciente al más antiguo.
 * Sirve para que el usuario vea exactamente qué se guardó: cantidad,
 * fecha y hora de cada vaso o botella de agua.
 */
export default function TodayHistoryList({ entries }: TodayHistoryListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de hoy 🕒</Text>

      {entries.length === 0 ? (
        <Text style={styles.emptyText}>
          Todavía no has registrado agua hoy. ¡Usa los botones de arriba para empezar! 💧
        </Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.item}>
            <Text style={styles.itemEmoji}>💧</Text>
            <Text style={styles.itemAmount}>{entry.amountMl} ml</Text>
            <Text style={styles.itemDateTime}>
              {entry.date} · {entry.time}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  itemAmount: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDateTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
