/**
 * Utilidades de fecha y hora usadas para guardar y mostrar los registros.
 * Se mantienen separadas de la lógica de almacenamiento para que sean
 * fáciles de probar y reutilizar.
 */

/** Devuelve la fecha en formato 'YYYY-MM-DD', ideal para comparar y guardar. */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Devuelve la hora en formato 'HH:mm', en formato de 24 horas. */
export function formatTime(date: Date): string {
  return formatHourMinute(date.getHours(), date.getMinutes());
}

/** Da formato 'HH:mm' a una hora y minuto sueltos, como los de un recordatorio. */
export function formatHourMinute(hour: number, minute: number): string {
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

/** Devuelve la fecha de hoy en formato 'YYYY-MM-DD'. */
export function getTodayKey(): string {
  return formatDate(new Date());
}

/** Devuelve un saludo según la hora actual del día. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Una hora antes de mediodía se considera "mañana"; el resto, "tarde/noche". */
export function isMorningHour(hour: number): boolean {
  return hour < 12;
}

/**
 * Devuelve las llaves de fecha ('YYYY-MM-DD') de los últimos `days` días,
 * de la más antigua a la más reciente, incluyendo el día de hoy. Sirve
 * para armar el resumen semanal sin importar qué días tienen registros.
 */
export function getLastDateKeys(days: number): string[] {
  const today = new Date();
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    keys.push(formatDate(date));
  }
  return keys;
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Convierte una llave de fecha 'YYYY-MM-DD' en su abreviatura de día (Lun, Mar, ...). */
export function formatWeekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return WEEKDAY_LABELS[date.getDay()];
}
