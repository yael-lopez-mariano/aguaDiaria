import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { ReminderTime } from '../types/settings';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function ScrollColumn({
  values,
  selectedIndex,
  onChange,
}: {
  values: string[];
  selectedIndex: number;
  onChange: (i: number) => void;
}) {
  const ref = useRef<ScrollView>(null);

  // Desplazamos al elemento seleccionado cada vez que cambia selectedIndex
  // (cuando el modal abre con un tiempo inicial, o se resetea).
  useEffect(() => {
    ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const commit = (y: number) => {
    const idx = Math.min(Math.max(Math.round(y / ITEM_HEIGHT), 0), values.length - 1);
    onChange(idx);
  };

  return (
    <View style={styles.colOuter}>
      {/* Caja de selección fija en el centro — visual de "carrete" */}
      <View style={styles.highlightBox} pointerEvents="none" />

      <ScrollView
        ref={ref}
        style={styles.col}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => commit(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => commit(e.nativeEvent.contentOffset.y)}
      >
        {values.map((val, i) => (
          <Pressable
            key={val}
            style={styles.colItem}
            onPress={() => {
              ref.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
              onChange(i);
            }}
          >
            <Text style={styles.colText}>{val}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

interface TimePickerModalProps {
  visible: boolean;
  time: ReminderTime;
  onConfirm: (time: ReminderTime) => void;
  onCancel: () => void;
}

/**
 * Modal tipo "carrete" para elegir hora y minuto con scroll.
 * Toca fuera de la tarjeta para cerrar sin cambiar la hora.
 */
export default function TimePickerModal({
  visible,
  time,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
  const [hour, setHour] = useState(time.hour);
  const [minute, setMinute] = useState(time.minute);

  // Sincroniza el estado interno cada vez que el modal se abre
  useEffect(() => {
    if (visible) {
      setHour(time.hour);
      setMinute(time.minute);
    }
  }, [visible, time.hour, time.minute]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Toca el fondo oscuro para cerrar */}
      <Pressable style={styles.overlay} onPress={onCancel}>
        {/* La tarjeta absorbe los toques para que no lleguen al overlay */}
        <Pressable style={styles.card}>
          <Text style={styles.title}>Elige la hora 🕐</Text>

          <View style={styles.pickerRow}>
            <ScrollColumn values={HOURS} selectedIndex={hour} onChange={setHour} />
            <Text style={styles.colon}>:</Text>
            <ScrollColumn values={MINUTES} selectedIndex={minute} onChange={setMinute} />
          </View>

          <View style={styles.colLabels}>
            <Text style={styles.colLabel}>hora</Text>
            <View style={styles.colonGap} />
            <Text style={styles.colLabel}>minutos</Text>
          </View>

          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={styles.confirmBtn}
              onPress={() => onConfirm({ hour, minute })}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },

  // ── Columnas de scroll ──────────────────────────────────────────────────────
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colOuter: {
    width: 82,
    height: COLUMN_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  highlightBox: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: '#99F6E420',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.teal,
    zIndex: 10,
  },
  col: {
    height: COLUMN_HEIGHT,
  },
  colItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  colon: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.tealDark,
    marginHorizontal: 8,
    lineHeight: ITEM_HEIGHT,
  },

  // ── Etiquetas debajo ────────────────────────────────────────────────────────
  colLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 22,
  },
  colLabel: {
    width: 82,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  colonGap: {
    width: 56,
  },

  // ── Botones ─────────────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.teal,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
