import { Alert, Platform } from 'react-native';

interface ConfirmActionOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
}

/**
 * Muestra una confirmación antes de una acción destructiva (borrar datos,
 * eliminar un registro, etc).
 *
 * `Alert.alert` no muestra ningún diálogo en la versión web (react-native-web
 * lo deja sin efecto), así que ahí usamos `window.confirm` del navegador para
 * que la confirmación también aparezca al usar AguaDiaria como PWA.
 */
export function confirmDestructiveAction(
  { title, message, confirmLabel, cancelLabel = 'Cancelar' }: ConfirmActionOptions,
  onConfirm: () => void,
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
