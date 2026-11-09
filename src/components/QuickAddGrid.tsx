import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QUICK_AMOUNTS } from '../constants/water';
import { colors } from '../constants/colors';
import { INFO } from '../constants/info';
import InfoButton from './InfoButton';
import QuickAddButton from './QuickAddButton';

interface QuickAddGridProps {
  onAdd: (amountMl: number) => void;
}

/** Cuadrícula 2x2 con los botones rápidos para registrar agua. */
export default function QuickAddGrid({ onAdd }: QuickAddGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Registrar agua 🚰</Text>
        <InfoButton info={INFO.quickAdd} />
      </View>
      <View style={styles.grid}>
        {QUICK_AMOUNTS.map((option) => (
          <QuickAddButton key={option.amountMl} option={option} onPress={onAdd} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
