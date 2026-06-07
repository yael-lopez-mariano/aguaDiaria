import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '../constants/colors';
import { AppSettings, ReminderMoment } from '../types/settings';
import { DailySummary } from '../types/water';

/**
 * Servicio de notificaciones locales de AguaDiaria.
 *
 * Aquí vive toda la integración con `expo-notifications`: configurar cómo
 * se muestran las notificaciones, pedir permiso, preparar el canal de
 * Android y programar/cancelar los recordatorios del día. La pantalla
 * y los hooks no hablan directamente con `expo-notifications`, solo
 * usan las funciones que exportamos aquí.
 */

// Para que una notificación se muestre mientras la app está abierta,
// expo-notifications necesita que le digamos cómo presentarla.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = 'agua-diaria-recordatorios';

interface ReminderSlotConfig {
  /** Identificador fijo: nos permite programar y cancelar siempre el mismo recordatorio. */
  id: string;
  /** Qué horario de `settings.reminderTimes` le corresponde a este recordatorio. */
  moment: ReminderMoment;
  title: string;
  body: string;
  /** A partir del resumen de hoy, decide si todavía hace falta recordarle al usuario. */
  isStillNeeded: (summary: DailySummary) => boolean;
}

/**
 * Los tres recordatorios del día. Cada uno define su mensaje, a qué
 * momento del día corresponde (para tomar su horario de `settings`) y la
 * condición que indica si todavía debe sonar (para no insistir si el
 * usuario ya registró agua en ese momento del día).
 */
const REMINDER_SLOT_CONFIGS: ReminderSlotConfig[] = [
  {
    id: 'agua-recordatorio-manana',
    moment: 'morning',
    title: 'AguaDiaria',
    body: '💧 Ya es momento de tomar un vaso de agua. Tu cuerpo lo necesita.',
    isStillNeeded: (summary) => !summary.drankInMorning,
  },
  {
    id: 'agua-recordatorio-tarde',
    moment: 'afternoon',
    title: 'AguaDiaria',
    body: '🚰 No olvides tomar agua esta tarde. Mantente hidratado.',
    isStillNeeded: (summary) => !summary.drankInAfternoonOrNight,
  },
  {
    id: 'agua-recordatorio-noche',
    moment: 'night',
    title: 'AguaDiaria',
    body: '🌙 Antes de dormir, toma un poco de agua si aún te falta hidratarte.',
    isStillNeeded: (summary) => !summary.drankInAfternoonOrNight,
  },
];

/** En Android, las notificaciones necesitan un "canal" antes de poder mostrarse. */
export async function ensureAndroidNotificationChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Recordatorios de hidratación',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 200, 200],
    lightColor: colors.primary,
  });
}

export interface NotificationPermissionState {
  granted: boolean;
  /** Si es `false`, el sistema ya no mostrará el diálogo de permiso de nuevo. */
  canAskAgain: boolean;
}

/** Consulta el estado actual del permiso de notificaciones, sin pedirlo. */
export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const current = await Notifications.getPermissionsAsync();
  return { granted: current.granted, canAskAgain: current.canAskAgain };
}

/** Muestra el diálogo del sistema para pedir permiso de notificaciones. */
export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return requested.granted;
}

function getTodayAt(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * Revisa los tres recordatorios del día y decide, para cada uno, si debe
 * quedar programado o cancelado:
 *
 *  - Se cancela si el usuario apagó las notificaciones, si su horario ya
 *    pasó hoy, o si ya registró agua en el momento del día que cubre.
 *  - Se programa (de nuevo), a la hora configurada en `settings`, si
 *    todavía no llega esa hora y el usuario aún no ha tomado agua en
 *    ese momento del día.
 *
 * Debe llamarse cada vez que cambie el resumen del día o la configuración
 * —por ejemplo, al abrir la app, justo después de registrar agua, o
 * cuando el usuario ajusta sus horarios en Configuración— para mantener
 * los recordatorios sincronizados con la realidad.
 */
export async function syncWaterReminders(summary: DailySummary, settings: AppSettings): Promise<void> {
  const now = Date.now();

  for (const config of REMINDER_SLOT_CONFIGS) {
    // Cancelamos siempre primero: como reutilizamos el mismo identificador
    // cada día, esto evita que quede una copia duplicada programada y es
    // la forma de "apagar" un recordatorio que ya no hace falta.
    await Notifications.cancelScheduledNotificationAsync(config.id);

    if (!settings.notificationsEnabled) {
      continue;
    }

    const { hour, minute } = settings.reminderTimes[config.moment];
    const triggerDate = getTodayAt(hour, minute);
    const timeAlreadyPassed = triggerDate.getTime() <= now;

    if (timeAlreadyPassed || !config.isStillNeeded(summary)) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: config.id,
      content: {
        title: config.title,
        body: config.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  }
}
