/**
 * Paleta de colores de AguaDiaria: tonos azules y blancos
 * inspirados en el agua, pensada para transmitir frescura y calma.
 */
export const colors = {
  background: '#EAF6FF',
  card: '#FFFFFF',

  primary: '#2F9BFF',
  primaryDark: '#1565C0',
  primaryLight: '#7FC8FF',

  accent: '#00C2D1',

  textPrimary: '#0B3954',
  textSecondary: '#5C7A99',
  textOnPrimary: '#FFFFFF',

  success: '#3BC48F',
  shadow: 'rgba(47, 155, 255, 0.25)',
  border: '#D6ECFF',
};

/**
 * Degradados azul-blanco usados para darle a la app una sensación de
 * "agua en movimiento": tarjeta principal, botones y barras de progreso.
 */
export const gradients = {
  hero: ['#5AB6FF', '#2F9BFF', '#1565C0'] as const,
  button: ['#7FC8FF', '#2F9BFF'] as const,
  progress: ['#9FDBFF', '#2F9BFF'] as const,
  card: ['#FFFFFF', '#EAF6FF'] as const,
};
