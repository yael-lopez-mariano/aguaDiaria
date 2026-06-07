import { AppSettings } from '../types/settings';

/**
 * Configuración por defecto: notificaciones activas con los mismos
 * horarios que se definieron originalmente para los recordatorios
 * (11:00, 17:00 y 21:00). El usuario puede ajustarlos en Configuración.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderTimes: {
    morning: { hour: 11, minute: 0 },
    afternoon: { hour: 17, minute: 0 },
    night: { hour: 21, minute: 0 },
  },
};
