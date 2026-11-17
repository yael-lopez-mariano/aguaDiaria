/**
 * Niveles y skins del juego "Llena el termo".
 *
 * Cada nivel tiene su propia temática (fondo, decoraciones y objetos que
 * caen) y es un poco más rápido que el anterior. Un nivel se completa al
 * juntar 10 estrellas jugando en él, y eso desbloquea el siguiente.
 *
 * Las skins cambian el aspecto del termo y se desbloquean con el total de
 * estrellas ganadas en todas las partidas.
 */

export const STARS_PER_LEVEL = 10;

export interface LevelTheme {
  id: number;
  name: string;
  emoji: string;
  /** Degradado de fondo de la zona de juego (de arriba a abajo). */
  background: readonly [string, string, ...string[]];
  /** Color del "suelo" ondulado de abajo. */
  floor: string;
  /** Color del borde de la zona de juego y acentos. */
  accent: string;
  dropEmoji: string;
  bombEmoji: string;
  /** Decoraciones que flotan suavemente en el fondo. */
  decorations: string[];
  /** Multiplica la velocidad de caída y de aparición de objetos. */
  speedMultiplier: number;
}

export const LEVELS: LevelTheme[] = [
  {
    id: 1,
    name: 'Laguna tropical',
    emoji: '🏝️',
    background: ['#0B3954', '#1565C0', '#1E96D8'],
    floor: 'rgba(45, 212, 191, 0.40)',
    accent: '#99F6E4',
    dropEmoji: '💧',
    bombEmoji: '💣',
    decorations: ['🐠', '🫧', '🐚', '🌿'],
    speedMultiplier: 1,
  },
  {
    id: 2,
    name: 'Playa al atardecer',
    emoji: '🌅',
    background: ['#4C1D95', '#DB2777', '#F59E0B'],
    floor: 'rgba(253, 230, 138, 0.55)',
    accent: '#FBCFE8',
    dropEmoji: '💧',
    bombEmoji: '💣',
    decorations: ['🌴', '☀️', '🦀', '🐚'],
    speedMultiplier: 1.12,
  },
  {
    id: 3,
    name: 'Selva lluviosa',
    emoji: '🌳',
    background: ['#052E16', '#166534', '#22C55E'],
    floor: 'rgba(132, 204, 22, 0.45)',
    accent: '#BBF7D0',
    dropEmoji: '💧',
    bombEmoji: '💣',
    decorations: ['🐸', '🦜', '🌿', '🍃'],
    speedMultiplier: 1.24,
  },
  {
    id: 4,
    name: 'Polo norte',
    emoji: '🐧',
    background: ['#0C4A6E', '#38BDF8', '#E0F2FE'],
    floor: 'rgba(255, 255, 255, 0.75)',
    accent: '#E0F2FE',
    dropEmoji: '🧊',
    bombEmoji: '💣',
    decorations: ['🐧', '❄️', '🏔️', '🐻‍❄️'],
    speedMultiplier: 1.36,
  },
  {
    id: 5,
    name: 'Desierto ardiente',
    emoji: '🌵',
    background: ['#7C2D12', '#EA580C', '#FCD34D'],
    floor: 'rgba(217, 119, 6, 0.55)',
    accent: '#FDE68A',
    dropEmoji: '💧',
    bombEmoji: '💣',
    decorations: ['🌵', '🐪', '☀️', '🦂'],
    speedMultiplier: 1.48,
  },
  {
    id: 6,
    name: 'Espacio exterior',
    emoji: '🚀',
    background: ['#020617', '#312E81', '#6D28D9'],
    floor: 'rgba(167, 139, 250, 0.35)',
    accent: '#C4B5FD',
    dropEmoji: '💧',
    bombEmoji: '☄️',
    decorations: ['🪐', '🚀', '✨', '🛸'],
    speedMultiplier: 1.6,
  },
];

export interface ThermosSkin {
  id: string;
  name: string;
  emoji: string;
  /** Estrellas totales necesarias para desbloquearla. */
  starsRequired: number;
  /** Degradado horizontal del cuerpo del termo. */
  body: readonly [string, string, ...string[]];
  border: string;
  lid: string;
  mouth: string;
  water: readonly [string, string];
  /** Emoji pequeño que se dibuja en el cuerpo del termo (opcional). */
  badge?: string;
}

export const SKINS: ThermosSkin[] = [
  {
    id: 'classic',
    name: 'Clásico',
    emoji: '🧪',
    starsRequired: 0,
    body: ['#0D9488', '#5EEAD4', '#14B8A6', '#0D9488'],
    border: '#CCFBF1',
    lid: '#0D9488',
    mouth: '#083344',
    water: ['#7FC8FF', '#2F9BFF'],
  },
  {
    id: 'bubblegum',
    name: 'Chicle',
    emoji: '🍬',
    starsRequired: 2,
    body: ['#DB2777', '#F9A8D4', '#EC4899', '#BE185D'],
    border: '#FCE7F3',
    lid: '#BE185D',
    mouth: '#500724',
    water: ['#A5F3FC', '#22D3EE'],
    badge: '💗',
  },
  {
    id: 'galaxy',
    name: 'Galaxia',
    emoji: '🌌',
    starsRequired: 5,
    body: ['#1E1B4B', '#6D28D9', '#A855F7', '#312E81'],
    border: '#DDD6FE',
    lid: '#4C1D95',
    mouth: '#0F0A2E',
    water: ['#C4B5FD', '#8B5CF6'],
    badge: '✨',
  },
  {
    id: 'fire',
    name: 'Fuego',
    emoji: '🔥',
    starsRequired: 10,
    body: ['#991B1B', '#F97316', '#FACC15', '#DC2626'],
    border: '#FED7AA',
    lid: '#B91C1C',
    mouth: '#450A0A',
    water: ['#7FC8FF', '#2F9BFF'],
    badge: '🔥',
  },
  {
    id: 'gold',
    name: 'Oro real',
    emoji: '👑',
    starsRequired: 20,
    body: ['#A16207', '#FDE047', '#EAB308', '#854D0E'],
    border: '#FEF9C3',
    lid: '#A16207',
    mouth: '#422006',
    water: ['#99F6E4', '#14B8A6'],
    badge: '👑',
  },
  {
    id: 'rainbow',
    name: 'Arcoíris',
    emoji: '🌈',
    starsRequired: 35,
    body: ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'],
    border: '#FFFFFF',
    lid: '#A78BFA',
    mouth: '#1E1B4B',
    water: ['#FFFFFF', '#93C5FD'],
    badge: '🦄',
  },
];

export function getLevel(id: number): LevelTheme {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}

export function getSkin(id: string): ThermosSkin {
  return SKINS.find((skin) => skin.id === id) ?? SKINS[0];
}

/** Un nivel está desbloqueado si es el primero o si el anterior ya se completó. */
export function isLevelUnlocked(levelId: number, levelStars: Record<number, number>): boolean {
  return levelId === 1 || (levelStars[levelId - 1] ?? 0) >= STARS_PER_LEVEL;
}
