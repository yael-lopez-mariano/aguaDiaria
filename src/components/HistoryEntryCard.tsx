import React, { useRef } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { WaterEntry } from '../types/water';

interface HistoryEntryCardProps {
  entry: WaterEntry;
  onDelete: (entryId: string) => void;
}

/**
 * Tarjeta de un registro dentro del Historial. Deja ver cuánto, cuándo
 * (fecha y hora) y permite borrarlo si el usuario se equivocó: primero
 * confirma con una alerta y, si acepta, la tarjeta se desvanece antes
 * de desaparecer de la lista.
 */
export default function HistoryEntryCard({ entry, onDelete }: HistoryEntryCardProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar registro',
      `¿Quieres eliminar el registro de ${entry.amountMl} ml del ${entry.date} a las ${entry.time}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }).start(() => onDelete(entry.id));
          },
        },
      ],
    );
  };

  const scale = fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Animated.View style={[styles.item, { opacity: fadeAnim, transform: [{ scale }] }]}>
      <Text style={styles.itemEmoji}>💧</Text>
      <View style={styles.itemTextBlock}>
        <Text style={styles.itemAmount}>{entry.amountMl} ml</Text>
        <Text style={styles.itemDateTime}>
          {entry.date} · {entry.time}
        </Text>
      </View>
      <Pressable onPress={confirmDelete} style={styles.deleteButton} hitSlop={8}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDateTime: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 17,
  },
});
