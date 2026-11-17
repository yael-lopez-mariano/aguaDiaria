import AsyncStorage from '@react-native-async-storage/async-storage';

/** Una partida terminada del juego "Llena el termo". */
export interface GameRecord {
  id: string;
  /** Momento en que terminó la partida (ms desde epoch). */
  timestamp: number;
  score: number;
  stars: number;
  dropsCaught: number;
  /** Nivel en el que se jugó (las partidas antiguas no lo tienen: nivel 1). */
  level?: number;
}

/** Todo lo que el juego guarda en el dispositivo. */
export interface GameData {
  /** Puntaje máximo conseguido en una sola partida. */
  bestScore: number;
  /** Estrellas acumuladas sumando todas las partidas. */
  totalStars: number;
  /** Estrellas acumuladas en cada nivel (id de nivel → estrellas). */
  levelStars: Record<number, number>;
  selectedLevel: number;
  selectedSkin: string;
  /** Últimas partidas, de la más reciente a la más antigua. */
  history: GameRecord[];
}

const GAME_STORAGE_KEY = '@aguadiaria:game';
const MAX_HISTORY = 20;

export const EMPTY_GAME_DATA: GameData = {
  bestScore: 0,
  totalStars: 0,
  levelStars: {},
  selectedLevel: 1,
  selectedSkin: 'classic',
  history: [],
};

async function writeGameData(data: GameData): Promise<void> {
  try {
    await AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('No se pudieron guardar los datos del juego:', error);
  }
}

export async function getGameData(): Promise<GameData> {
  try {
    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return EMPTY_GAME_DATA;
    const stored = JSON.parse(raw) as Partial<GameData>;
    const totalStars = stored.totalStars ?? 0;
    return {
      bestScore: stored.bestScore ?? 0,
      totalStars,
      // Antes de existir los niveles todas las estrellas eran del nivel 1.
      levelStars: stored.levelStars ?? (totalStars > 0 ? { 1: totalStars } : {}),
      selectedLevel: stored.selectedLevel ?? 1,
      selectedSkin: stored.selectedSkin ?? 'classic',
      history: stored.history ?? [],
    };
  } catch (error) {
    console.warn('No se pudieron leer los datos del juego:', error);
    return EMPTY_GAME_DATA;
  }
}

/**
 * Guarda una partida terminada: la agrega al historial (conservando solo
 * las últimas 20), suma sus estrellas al total y al nivel jugado, y
 * actualiza el récord. Devuelve los datos actualizados.
 */
export async function saveGameResult(result: Omit<GameRecord, 'id' | 'timestamp'> & { level: number }): Promise<GameData> {
  const current = await getGameData();
  const now = Date.now();
  const record: GameRecord = { id: `${now}`, timestamp: now, ...result };
  const updated: GameData = {
    ...current,
    bestScore: Math.max(current.bestScore, result.score),
    totalStars: current.totalStars + result.stars,
    levelStars: {
      ...current.levelStars,
      [result.level]: (current.levelStars[result.level] ?? 0) + result.stars,
    },
    history: [record, ...current.history].slice(0, MAX_HISTORY),
  };
  await writeGameData(updated);
  return updated;
}

/** Guarda qué nivel y qué skin eligió el jugador. */
export async function saveGameSelection(selection: { selectedLevel?: number; selectedSkin?: string }): Promise<GameData> {
  const current = await getGameData();
  const updated: GameData = { ...current, ...selection };
  await writeGameData(updated);
  return updated;
}

/** Borra récord, estrellas, niveles, skins elegidas e historial del juego. */
export async function clearGameData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudieron borrar los datos del juego:', error);
  }
}
