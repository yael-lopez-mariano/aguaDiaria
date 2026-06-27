/**
 * Paleta de AguaDiaria: azul agua para el tanque y elementos de "agua",
 * verde agua (teal) para botones, gráficas y elementos interactivos.
 * La combinación transmite frescura de laguna tropical.
 */
export const colors = {
  background: '#EAFAF8',
  card: '#FFFFFF',

  // Azul agua: tanque de progreso y elementos que representan agua literal
  primary: '#2F9BFF',
  primaryDark: '#1565C0',
  primaryLight: '#7FC8FF',

  // Verde agua: botones de acción, gráficas, tab activo, interactivos
  teal: '#14B8A6',
  tealDark: '#0D9488',
  tealLight: '#99F6E4',

  accent: '#14B8A6',

  textPrimary: '#0B3954',
  textSecondary: '#5C7A99',
  textOnPrimary: '#FFFFFF',

  success: '#22C55E',
  shadow: 'rgba(20, 184, 166, 0.2)',
  border: '#CCFAF4',
};

/**
 * Degradados: hero va de verde agua a azul profundo (como una laguna),
 * button y card son teal; el tanque de agua sigue siendo azul.
 */
export const gradients = {
  hero: ['#2DD4BF', '#1E96D8', '#1565C0'] as const,
  button: ['#5EEAD4', '#14B8A6'] as const,
  progress: ['#9FDBFF', '#2F9BFF'] as const,
  card: ['#FFFFFF', '#EAFAF8'] as const,
};
