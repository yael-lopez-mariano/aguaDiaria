/**
 * Botones rápidos para registrar agua y la meta diaria de referencia.
 * Cambiar estos valores ajusta toda la app, ya que los componentes
 * los leen desde aquí.
 */
export interface QuickAmountOption {
  label: string;
  amountMl: number;
  emoji: string;
}

export const QUICK_AMOUNTS: QuickAmountOption[] = [
  { label: '250 ml', amountMl: 250, emoji: '🥤' },
  { label: '500 ml', amountMl: 500, emoji: '🥛' },
  { label: '750 ml', amountMl: 750, emoji: '🧃' },
  { label: '1 litro', amountMl: 1000, emoji: '🍶' },
];

/** Meta diaria sugerida por defecto; el usuario puede ajustarla en Estadísticas. */
export const DAILY_GOAL_ML = 2000;

/** Si un día se tomó menos de esta fracción de la meta, se cuenta como "poca agua". */
export const LOW_WATER_RATIO = 0.5;
