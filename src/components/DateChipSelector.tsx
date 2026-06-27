import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { formatWeekdayLabel, getTodayKey } from '../utils/date';

interface DateChipSelectorProps {
  dateKeys: string[];
  selectedDateKey: string;
  onSelect: (dateKey: string) => void;
}

interface DateChipProps {
  dateKey: string;
  isSelected: boolean;
  onPress: () => void;
}

function DateChip({ dateKey, isSelected, onPress }: DateChipProps) {
  const isToday = dateKey === getTodayKey();
  const dayNumber = Number(dateKey.split('-')[2]);
  const topLabel = isToday ? 'Hoy' : formatWeekdayLabel(dateKey);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
    >
      <Text style={[styles.chipTop, isSelected && styles.chipTextSelected]}>{topLabel}</Text>
      <Text style={[styles.chipDay, isSelected && styles.chipTextSelected]}>{dayNumber}</Text>
    </Pressable>
  );
}

/**
 * Selector horizontal de fechas: muestra "Hoy" y los días anteriores que
 * tienen registros guardados, para que el usuario pueda saltar entre ellos
 * y revisar su historial sin perder de vista el día actual.
 */
export default function DateChipSelector({ dateKeys, selectedDateKey, onSelect }: DateChipSelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dateKeys.map((dateKey) => (
          <DateChip
            key={dateKey}
            dateKey={dateKey}
            isSelected={dateKey === selectedDateKey}
            onPress={() => onSelect(dateKey)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  chipTop: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipDay: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
  },
});
