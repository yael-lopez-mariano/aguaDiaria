import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterEntry } from '../types/water';
import { formatDate, formatTime } from '../utils/date';

/**
 * Toda la app guarda sus registros bajo esta única llave en AsyncStorage,
 * como una lista de WaterEntry en formato JSON.
 */
const ENTRIES_STORAGE_KEY = '@aguadiaria:entries';

/** Lee todos los registros guardados en el celular, sin importar la fecha. */
export async function getAllEntries(): Promise<WaterEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WaterEntry[];
  } catch (error) {
    console.warn('No se pudieron leer los registros de agua guardados:', error);
    return [];
  }
}

/**
 * Crea un nuevo registro con la cantidad indicada, lo guarda junto con los
 * existentes y devuelve la lista actualizada para refrescar la pantalla.
 */
export async function addWaterEntry(amountMl: number): Promise<WaterEntry[]> {
  const now = new Date();
  const newEntry: WaterEntry = {
    id: `${now.getTime()}`,
    amountMl,
    date: formatDate(now),
    time: formatTime(now),
    timestamp: now.getTime(),
  };

  const existingEntries = await getAllEntries();
  const updatedEntries = [newEntry, ...existingEntries];

  try {
    await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.warn('No se pudo guardar el registro de agua:', error);
  }

  return updatedEntries;
}

/**
 * Elimina un registro por su id (por ejemplo, si el usuario se equivocó al
 * tocar un botón rápido), guarda la lista resultante y la devuelve para que
 * la pantalla de Historial recalcule sus totales al instante.
 */
export async function deleteWaterEntry(entryId: string): Promise<WaterEntry[]> {
  const existingEntries = await getAllEntries();
  const updatedEntries = existingEntries.filter((entry) => entry.id !== entryId);

  try {
    await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.warn('No se pudo eliminar el registro de agua:', error);
  }

  return updatedEntries;
}

/** Borra todos los registros guardados (usado al "borrar todos los datos" en Configuración). */
export async function clearAllEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ENTRIES_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudieron borrar los registros guardados:', error);
  }
}

/** Filtra, de una lista de registros, solo los que pertenecen a una fecha dada. */
export function filterEntriesByDate(entries: WaterEntry[], dateKey: string): WaterEntry[] {
  return entries.filter((entry) => entry.date === dateKey);
}
