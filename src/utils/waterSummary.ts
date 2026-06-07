import { LOW_WATER_RATIO } from '../constants/water';
import { DailySummary, DayStat, WaterEntry, WeeklySummary } from '../types/water';
import { getLastDateKeys, isMorningHour } from './date';

/**
 * Convierte la lista de registros de un día en el resumen que se muestra
 * al usuario: total tomado, número de veces y en qué momentos del día bebió agua.
 */
export function calculateDailySummary(todayEntries: WaterEntry[]): DailySummary {
  let totalMl = 0;
  let drankInMorning = false;
  let drankInAfternoonOrNight = false;

  for (const entry of todayEntries) {
    totalMl += entry.amountMl;

    const hour = Number(entry.time.split(':')[0]);
    if (isMorningHour(hour)) {
      drankInMorning = true;
    } else {
      drankInAfternoonOrNight = true;
    }
  }

  return {
    totalMl,
    count: todayEntries.length,
    drankInMorning,
    drankInAfternoonOrNight,
  };
}

/**
 * Traduce qué tan cerca está el usuario de su meta diaria en un mensaje
 * de ánimo amigable, usado tanto en el resumen del día como en Estadísticas.
 */
export function getHydrationStatusMessage(percentOfGoal: number): string {
  if (percentOfGoal >= 100) return 'Excelente hidratación 💧';
  if (percentOfGoal >= 50) return 'Vas bien, sigue tomando agua 🚰';
  return 'Te falta tomar más agua ⚠️';
}

/**
 * Agrupa todos los registros guardados por día para los últimos 7 días
 * (incluyendo hoy) y calcula el total semanal, el promedio diario, y
 * cuántos de esos días se cumplió la meta o se tomó poca agua, comparando
 * cada día contra `goalMl`.
 */
export function calculateWeeklySummary(allEntries: WaterEntry[], goalMl: number): WeeklySummary {
  const days: DayStat[] = getLastDateKeys(7).map((dateKey) => ({
    dateKey,
    totalMl: allEntries
      .filter((entry) => entry.date === dateKey)
      .reduce((sum, entry) => sum + entry.amountMl, 0),
  }));

  const totalMl = days.reduce((sum, day) => sum + day.totalMl, 0);
  const averageMl = Math.round(totalMl / days.length);
  const daysMetGoal = days.filter((day) => day.totalMl >= goalMl).length;
  const daysLowWater = days.filter((day) => day.totalMl < goalMl * LOW_WATER_RATIO).length;

  return { totalMl, averageMl, daysMetGoal, daysLowWater, days };
}
