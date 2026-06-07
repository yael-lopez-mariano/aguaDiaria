/** Hora y minuto (formato 24h) en los que debe sonar un recordatorio. */
export interface ReminderTime {
  hour: number;
  minute: number;
}

/** Los tres momentos del día en los que la app puede recordarle al usuario tomar agua. */
export type ReminderMoment = 'morning' | 'afternoon' | 'night';

/**
 * Configuración general de la app, guardada localmente y compartida entre
 * la pantalla principal (que sincroniza los recordatorios) y la de
 * Configuración (donde el usuario la edita).
 */
export interface AppSettings {
  notificationsEnabled: boolean;
  reminderTimes: Record<ReminderMoment, ReminderTime>;
}
