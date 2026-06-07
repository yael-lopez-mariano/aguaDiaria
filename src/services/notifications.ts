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

/**
 * Nombre del archivo de sonido personalizado (una "gota de agua" sintetizada)
 * que se registra mediante el plugin de `expo-notifications` en `app.json`
 * (carpeta `assets/sounds/`). `expo-notifications` resuelve este mismo nombre
 * tanto para el canal de Android como para el contenido en iOS.
 */
const WATER_DROP_SOUND = 'water_drop.wav';

interface ReminderSlotConfig {
  /** Identificador fijo: nos permite programar y cancelar siempre el mismo recordatorio. */
  id: string;
  /** Qué horario de `settings.reminderTimes` le corresponde a este recordatorio. */
  moment: ReminderMoment;
  title: string;
  /** A partir del resumen de hoy, decide si todavía hace falta recordarle al usuario. */
  isStillNeeded: (summary: DailySummary) => boolean;
  /**
   * Arma el mensaje de este recordatorio a partir de cuánta agua le falta al
   * usuario para llegar a su meta. Así cada aviso refleja su progreso real
   * del día en lugar de repetir siempre el mismo texto genérico.
   */
  buildBody: (remainingMl: number) => string;
}

function formatRemainingMl(remainingMl: number): string {
  return remainingMl >= 1000 ? `${(remainingMl / 1000).toFixed(1)} L` : `${remainingMl} ml`;
}

/**
 * Los tres recordatorios del día. Cada uno define a qué momento del día
 * corresponde (para tomar su horario de `settings`), la condición que indica
 * si todavía debe sonar (para no insistir si el usuario ya registró agua en
 * ese momento del día), y cómo personalizar su mensaje según lo que le falte
 * para llegar a la meta.
 */
const REMINDER_SLOT_CONFIGS: ReminderSlotConfig[] = [
  {
    id: 'agua-recordatorio-manana',
    moment: 'morning',
    title: 'AguaDiaria 🌅',
    isStillNeeded: (summary) => !summary.drankInMorning,
    buildBody: (remainingMl) =>
      `💧 Buenos días. Para llegar a tu meta de hoy te faltan ${formatRemainingMl(remainingMl)}. ¡Empieza el día con un buen vaso de agua!`,
  },
  {
    id: 'agua-recordatorio-tarde',
    moment: 'afternoon',
    title: 'AguaDiaria ☀️',
    isStillNeeded: (summary) => !summary.drankInAfternoonOrNight,
    buildBody: (remainingMl) =>
      `🚰 Vas a la mitad del día y aún te faltan ${formatRemainingMl(remainingMl)} para tu meta. Aprovecha y toma un poco de agua ahora.`,
  },
  {
    id: 'agua-recordatorio-noche',
    moment: 'night',
    title: 'AguaDiaria 🌙',
    isStillNeeded: (summary) => !summary.drankInAfternoonOrNight,
    buildBody: (remainingMl) =>
      `🌙 Antes de dormir te faltan ${formatRemainingMl(remainingMl)} para cerrar tu meta de hoy. Un último vaso de agua y listo.`,
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
    // En Android 8+ el sonido se controla desde el canal: aquí es donde
    // realmente se aplica nuestro sonido de "gota de agua" personalizado.
    sound: WATER_DROP_SOUND,
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
 * Debe llamarse cada vez que cambie el resumen del día, la meta o la
 * configuración —por ejemplo, al abrir la app, justo después de registrar
 * agua, cuando el usuario cambia su meta diaria, o cuando ajusta sus
 * horarios en Configuración— para mantener los recordatorios sincronizados
 * con la realidad.
 */
export async function syncWaterReminders(
  summary: DailySummary,
  settings: AppSettings,
  dailyGoalMl: number,
): Promise<void> {
  const now = Date.now();
  const remainingMl = Math.max(dailyGoalMl - summary.totalMl, 0);

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
        body: config.buildBody(remainingMl),
        // En iOS (y en Android 7 o anterior) el sonido se toma de aquí;
        // en Android 8+ manda el sonido configurado en el canal.
        sound: WATER_DROP_SOUND,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  }
}
