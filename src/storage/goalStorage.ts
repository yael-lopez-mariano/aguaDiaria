import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_GOAL_ML } from '../constants/water';

/** Llave bajo la que se guarda la meta diaria configurable del usuario. */
const GOAL_STORAGE_KEY = '@aguadiaria:dailyGoal';

/** Lee la meta diaria guardada, o la meta por defecto si nunca se ha cambiado. */
export async function getDailyGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return DAILY_GOAL_ML;

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DAILY_GOAL_ML;
  } catch (error) {
    console.warn('No se pudo leer la meta diaria guardada:', error);
    return DAILY_GOAL_ML;
  }
}

/** Guarda la nueva meta diaria que el usuario eligió en Estadísticas. */
export async function setDailyGoal(goalMl: number): Promise<void> {
  try {
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, `${goalMl}`);
  } catch (error) {
    console.warn('No se pudo guardar la meta diaria:', error);
  }
}
