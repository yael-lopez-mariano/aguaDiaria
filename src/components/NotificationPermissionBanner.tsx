import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { NotificationPermissionStatus } from '../hooks/useWaterReminders';

interface NotificationPermissionBannerProps {
  status: NotificationPermissionStatus;
  onRequestPermission: () => void;
}

/**
 * Aviso amigable que invita al usuario a activar las notificaciones para
 * recibir los recordatorios de hidratación. Solo aparece cuando el permiso
 * todavía no está concedido, y desaparece solo en cuanto se activa.
 */
export default function NotificationPermissionBanner({
  status,
  onRequestPermission,
}: NotificationPermissionBannerProps) {
  if (status !== 'denied') return null;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Activa tus recordatorios</Text>
        <Text style={styles.subtitle}>
          Permite las notificaciones para que AguaDiaria te avise cuando sea momento de tomar agua.
        </Text>
      </View>
      <Pressable style={styles.button} onPress={onRequestPermission}>
        <Text style={styles.buttonText}>Activar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  emoji: {
    fontSize: 26,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
