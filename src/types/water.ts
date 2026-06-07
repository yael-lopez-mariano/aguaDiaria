/**
 * Representa un único registro de "tomé agua".
 * Se guarda tal cual en el almacenamiento local del celular.
 */
export interface WaterEntry {
  id: string;
  amountMl: number;
  date: string; // formato 'YYYY-MM-DD'
  time: string; // formato 'HH:mm'
  timestamp: number; // útil para ordenar y comparar registros
}

/**
 * Resumen calculado a partir de los registros de un día.
 */
export interface DailySummary {
  totalMl: number;
  count: number;
  drankInMorning: boolean;
  drankInAfternoonOrNight: boolean;
}

/** Total tomado en un día puntual; es la "barra" que arma el resumen semanal. */
export interface DayStat {
  dateKey: string; // formato 'YYYY-MM-DD'
  totalMl: number;
}

/**
 * Resumen calculado a partir de los registros de los últimos 7 días
 * (incluyendo hoy), comparado contra la meta diaria configurada.
 */
export interface WeeklySummary {
  totalMl: number;
  averageMl: number;
  daysMetGoal: number;
  daysLowWater: number;
  days: DayStat[];
}
