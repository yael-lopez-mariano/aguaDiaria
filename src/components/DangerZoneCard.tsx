import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { confirmDestructiveAction } from '../utils/confirm';

interface DangerZoneCardProps {
  onConfirmClear: () => void;
}

/**
 * Tarjeta para borrar todos los datos guardados de la app (registros,
 * meta diaria, configuración de recordatorios y nombre guardado, dejando
 * la app como recién instalada). Pide confirmación antes de actuar, ya
 * que es una acción permanente que no se puede deshacer.
 *
 * Usamos `confirmDestructiveAction` en lugar de `Alert.alert` directo
 * porque en la versión web (PWA) `Alert.alert` no muestra ningún diálogo;
 * ese helper cae a `window.confirm` ahí para que la confirmación sí aparezca.
 */
export default function DangerZoneCard({ onConfirmClear }: DangerZoneCardProps) {
  const handlePress = () => {
    confirmDestructiveAction(
      {
        title: '¿Borrar todos tus datos?',
        message:
          'Esto eliminará tus registros de agua, tu meta diaria, tus recordatorios y tu nombre guardado en este celular. La app quedará como recién instalada y volverá a pedirte tu nombre. Esta acción no se puede deshacer.',
        confirmLabel: 'Borrar todo',
      },
      onConfirmClear,
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zona de riesgo ⚠️</Text>
      <Text style={styles.subtitle}>
        Borra de forma permanente todo lo que AguaDiaria guardó en este celular: tus registros,
        tu meta diaria, tus recordatorios y tu nombre. Es como empezar de nuevo desde cero.
      </Text>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Borrar todos los datos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFD9D9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#E5484D',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
