import AsyncStorage from '@react-native-async-storage/async-storage';

/** Una partida terminada del juego "Llena el termo". */
export interface GameRecord {
  id: string;
  /** Momento en que terminó la partida (ms desde epoch). */
  timestamp: number;
  score: number;
  stars: number;
  dropsCaught: number;
}

/** Todo lo que el juego guarda en el dispositivo. */
export interface GameData {
  /** Puntaje máximo conseguido en una sola partida. */
  bestScore: number;
  /** Estrellas acumuladas sumando todas las partidas. */
  totalStars: number;
  /** Últimas partidas, de la más reciente a la más antigua. */
  history: GameRecord[];
}

const GAME_STORAGE_KEY = '@aguadiaria:game';
const MAX_HISTORY = 20;

export const EMPTY_GAME_DATA: GameData = { bestScore: 0, totalStars: 0, history: [] };

export async function getGameData(): Promise<GameData> {
  try {
    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return EMPTY_GAME_DATA;
    const stored = JSON.parse(raw) as Partial<GameData>;
    return {
      bestScore: stored.bestScore ?? 0,
      totalStars: stored.totalStars ?? 0,
      history: stored.history ?? [],
    };
  } catch (error) {
    console.warn('No se pudieron leer los datos del juego:', error);
    return EMPTY_GAME_DATA;
  }
}

/**
 * Guarda una partida terminada: la agrega al historial (conservando solo
 * las últimas 20), suma sus estrellas al total y actualiza el récord.
 * Devuelve los datos actualizados para refrescar la pantalla.
 */
export async function saveGameResult(result: Omit<GameRecord, 'id' | 'timestamp'>): Promise<GameData> {
  const current = await getGameData();
  const now = Date.now();
  const record: GameRecord = { id: `${now}`, timestamp: now, ...result };
  const updated: GameData = {
    bestScore: Math.max(current.bestScore, result.score),
    totalStars: current.totalStars + result.stars,
    history: [record, ...current.history].slice(0, MAX_HISTORY),
  };
  try {
    await AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('No se pudo guardar la partida:', error);
  }
  return updated;
}

/** Borra récord, estrellas e historial del juego. */
export async function clearGameData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudieron borrar los datos del juego:', error);
  }
}
