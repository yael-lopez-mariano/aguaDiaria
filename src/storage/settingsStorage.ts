import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { AppSettings } from '../types/settings';

/** Llave bajo la que se guarda toda la configuración (notificaciones y horarios). */
const SETTINGS_STORAGE_KEY = '@aguadiaria:settings';

/**
 * Lee la configuración guardada. Si nunca se guardó nada, o si falta algún
 * campo (por ejemplo, porque la app se actualizó), se completa con los
 * valores por defecto para que la app nunca se quede sin un horario válido.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const stored = JSON.parse(raw) as Partial<AppSettings>;
    return {
      notificationsEnabled: stored.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
      reminderTimes: {
        morning: stored.reminderTimes?.morning ?? DEFAULT_SETTINGS.reminderTimes.morning,
        afternoon: stored.reminderTimes?.afternoon ?? DEFAULT_SETTINGS.reminderTimes.afternoon,
        night: stored.reminderTimes?.night ?? DEFAULT_SETTINGS.reminderTimes.night,
      },
    };
  } catch (error) {
    console.warn('No se pudo leer la configuración guardada:', error);
    return DEFAULT_SETTINGS;
  }
}

/** Guarda la configuración completa (se llama cada vez que el usuario cambia algo). */
export async function setSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('No se pudo guardar la configuración:', error);
  }
}
