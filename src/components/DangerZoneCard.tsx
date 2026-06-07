import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface DangerZoneCardProps {
  onConfirmClear: () => void;
}

/**
 * Tarjeta para borrar todos los datos guardados de la app (registros,
 * meta diaria y configuración de recordatorios). Pide confirmación antes
 * de actuar, ya que es una acción permanente que no se puede deshacer.
 */
export default function DangerZoneCard({ onConfirmClear }: DangerZoneCardProps) {
  const handlePress = () => {
    Alert.alert(
      'Borrar todos los datos',
      'Esto eliminará tus registros de agua, tu meta diaria y tus horarios de recordatorio guardados en este celular. Esta acción no se puede deshacer. ¿Quieres continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: onConfirmClear },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zona de riesgo ⚠️</Text>
      <Text style={styles.subtitle}>
        Borra de forma permanente todo lo que AguaDiaria guardó en este celular: tus registros,
        tu meta diaria y tus recordatorios.
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
