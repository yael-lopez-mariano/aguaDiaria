/** Reglas y ajustes del juego "Llena el termo". */
export const GAME = {
  pointsPerDrop: 10,
  pointsPerStar: 100,
  maxBombs: 3,

  thermosWidth: 64,
  thermosHeight: 92,
  itemSize: 34,

  /** Velocidad de caída inicial y máxima (px por segundo). */
  startFallSpeed: 150,
  maxFallSpeed: 560,
  /** Cuánto aumenta la velocidad de caída por cada segundo de partida. */
  fallSpeedPerSecond: 7,

  /** Tiempo entre objetos que caen (ms): empieza lento y se acelera. */
  startSpawnMs: 950,
  minSpawnMs: 340,
  spawnMsPerSecond: 12,

  /** Probabilidad de que lo que cae sea una bomba (sube con el tiempo). */
  startBombChance: 0.2,
  maxBombChance: 0.42,
  bombChancePerSecond: 0.004,

  /** Velocidad del termo al usar las flechas del teclado (px/s). */
  keyboardSpeed: 480,
};
