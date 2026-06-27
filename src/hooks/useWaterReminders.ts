import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { AppSettings } from '../types/settings';
import { DailySummary } from '../types/water';
import {
  ensureAndroidNotificationChannelAsync,
  getNotificationPermissionState,
  requestNotificationPermissionAsync,
  syncWaterReminders,
} from '../services/notifications';

export type NotificationPermissionStatus = 'checking' | 'granted' | 'denied';

/**
 * Hook que conecta la pantalla principal con el servicio de notificaciones:
 *
 *  1. Al montar, prepara el canal de Android y pide permiso si hace falta.
 *  2. Cada vez que el resumen del día cambia (por ejemplo, al registrar
 *     agua), vuelve a sincronizar los recordatorios programados.
 *  3. Expone el estado del permiso y una función `requestPermission` para
 *     que la pantalla pueda mostrar un aviso y dejar que el usuario lo
 *     active manualmente si lo había rechazado antes.
 *
 * @param summary Resumen del día actual (total, conteo, mañana/tarde-noche).
 * @param settings Configuración del usuario: si las notificaciones están
 *   activas y a qué hora debe sonar cada recordatorio.
 * @param dailyGoalMl Meta diaria configurada: se usa para calcular cuánta
 *   agua le falta al usuario y así personalizar el mensaje de cada aviso.
 * @param isReady Indica si los registros de hoy ya se cargaron del almacenamiento.
 */
export function useWaterReminders(
  summary: DailySummary,
  settings: AppSettings,
  dailyGoalMl: number,
  isReady: boolean,
) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('checking');

  // Pide permiso solo si el sistema todavía puede preguntar; si el usuario
  // ya lo rechazó de forma permanente, no insistimos con el diálogo.
  const ensurePermission = useCallback(async () => {
    const state = await getNotificationPermissionState();
    if (state.granted) {
      setPermissionStatus('granted');
      return;
    }
    if (!state.canAskAgain) {
      setPermissionStatus('denied');
      return;
    }
    const granted = await requestNotificationPermissionAsync();
    setPermissionStatus(granted ? 'granted' : 'denied');
  }, []);

  // Esta versión es para cuando el usuario toca el botón "Activar" del
  // aviso: además de pedir el permiso, si ya no se puede volver a preguntar
  // lo llevamos directo a los Ajustes del celular para que lo active ahí.
  const requestPermission = useCallback(async () => {
    const state = await getNotificationPermissionState();
    if (state.granted) {
      setPermissionStatus('granted');
      return;
    }
    if (state.canAskAgain) {
      const granted = await requestNotificationPermissionAsync();
      setPermissionStatus(granted ? 'granted' : 'denied');
      return;
    }
    setPermissionStatus('denied');
    if (Platform.OS !== 'web') Linking.openSettings();
  }, []);

  useEffect(() => {
    (async () => {
      await ensureAndroidNotificationChannelAsync();
      await ensurePermission();
    })();
  }, [ensurePermission]);

  useEffect(() => {
    if (!isReady || permissionStatus !== 'granted') return;
    syncWaterReminders(summary, settings, dailyGoalMl);
    // A propósito NO dependemos de todo el objeto `summary` (cambia en cada
    // registro), sino de las banderas que deciden qué recordatorios siguen
    // haciendo falta y del total (que entra en el mensaje personalizado):
    // así evitamos reprogramar de más sin perder la personalización.
    // `settings` y `dailyGoalMl` sí se incluyen completos: cualquier cambio
    // ahí (apagar notificaciones, mover un horario, ajustar la meta) debe
    // re-sincronizar de inmediato.
  }, [
    isReady,
    permissionStatus,
    summary.drankInMorning,
    summary.drankInAfternoonOrNight,
    summary.totalMl,
    settings,
    dailyGoalMl,
  ]);

  return { permissionStatus, requestPermission };
}
