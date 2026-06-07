import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DateChipSelector from '../components/DateChipSelector';
import HistoryEntryCard from '../components/HistoryEntryCard';
import { colors } from '../constants/colors';
import { deleteWaterEntry, filterEntriesByDate, getAllEntries } from '../storage/waterStorage';
import { WaterEntry } from '../types/water';
import { getTodayKey } from '../utils/date';
import { calculateDailySummary } from '../utils/waterSummary';

/**
 * Pantalla de Historial: deja revisar los registros de agua de hoy y de
 * días anteriores agrupados por fecha, y borrar uno si el usuario se
 * equivocó. Al borrar, los totales del día se recalculan al instante
 * porque se derivan de la misma lista de registros que se guarda aquí.
 */
export default function HistoryScreen() {
  const [allEntries, setAllEntries] = useState<WaterEntry[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const entries = await getAllEntries();
    setAllEntries(entries);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Lista de fechas para el selector: "Hoy" siempre aparece, más cualquier
  // otro día que tenga registros guardados, de la más reciente a la más vieja.
  const availableDateKeys = useMemo(() => {
    const keys = new Set<string>([getTodayKey()]);
    allEntries.forEach((entry) => keys.add(entry.date));
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1));
  }, [allEntries]);

  const selectedEntries = useMemo(
    () => filterEntriesByDate(allEntries, selectedDateKey),
    [allEntries, selectedDateKey],
  );
  const selectedSummary = calculateDailySummary(selectedEntries);
  const isSelectedToday = selectedDateKey === getTodayKey();

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    const updatedEntries = await deleteWaterEntry(entryId);
    setAllEntries(updatedEntries);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Historial 🕒</Text>
        <Text style={styles.subtitle}>Revisa y corrige tus registros de cualquier día</Text>
      </View>

      {!isLoading && (
        <DateChipSelector
          dateKeys={availableDateKeys}
          selectedDateKey={selectedDateKey}
          onSelect={setSelectedDateKey}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isLoading && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryDate}>
                {isSelectedToday ? 'Hoy' : selectedDateKey}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>💧 {selectedSummary.totalMl} ml</Text>
                <Text style={styles.summaryValue}>🔁 {selectedSummary.count} registros</Text>
              </View>
            </View>

            {selectedEntries.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay registros guardados para este día. 💧
              </Text>
            ) : (
              selectedEntries.map((entry) => (
                <HistoryEntryCard key={entry.id} entry={entry} onDelete={handleDeleteEntry} />
              ))
            )}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  summaryDate: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
