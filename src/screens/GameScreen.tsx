import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InfoButton from '../components/InfoButton';
import LevelSelector from '../components/game/LevelSelector';
import SkinSelector from '../components/game/SkinSelector';
import Thermos from '../components/game/Thermos';
import { colors } from '../constants/colors';
import { GAME } from '../constants/game';
import { getLevel, getSkin, LEVELS, SKINS, STARS_PER_LEVEL, ThermosSkin } from '../constants/gameThemes';
import { INFO } from '../constants/info';
import {
  EMPTY_GAME_DATA,
  GameData,
  getGameData,
  saveGameResult,
  saveGameSelection,
} from '../storage/gameStorage';

type GameStatus = 'ready' | 'playing' | 'over';

interface FallingItem {
  id: number;
  kind: 'drop' | 'bomb';
  x: number;
  y: number;
  speedFactor: number;
  spin: number;
}

type EffectKind = 'splash' | 'boom' | 'star' | 'level';

interface Effect {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  bornAt: number;
}

/** Estado "vivo" de la partida: se muta en cada cuadro sin pasar por React. */
interface GameState {
  items: FallingItem[];
  effects: Effect[];
  thermosX: number;
  targetX: number;
  score: number;
  stars: number;
  dropsCaught: number;
  bombsHit: number;
  elapsed: number;
  spawnTimerMs: number;
  nextId: number;
  shakeUntil: number;
  levelAnnounced: boolean;
  keys: { left: boolean; right: boolean };
}

interface GameResult {
  score: number;
  stars: number;
  isRecord: boolean;
  levelCompleted: boolean;
  nextLevelId: number | null;
  newSkins: ThermosSkin[];
}

function createGameState(width: number): GameState {
  return {
    items: [],
    effects: [],
    thermosX: width / 2,
    targetX: width / 2,
    score: 0,
    stars: 0,
    dropsCaught: 0,
    bombsHit: 0,
    elapsed: 0,
    spawnTimerMs: 600,
    nextId: 1,
    shakeUntil: 0,
    levelAnnounced: false,
    keys: { left: false, right: false },
  };
}

const EFFECT_DURATION: Record<EffectKind, number> = { splash: 0.7, boom: 0.8, star: 1, level: 2 };
const THERMOS_BOTTOM_MARGIN = 10;
const HUD_HEIGHT = 46;

/** Posiciones fijas de las decoraciones de fondo (en % del área). */
const DECORATION_SPOTS = [
  { left: '8%', top: '22%', size: 26 },
  { left: '78%', top: '30%', size: 32 },
  { left: '50%', top: '52%', size: 20 },
  { left: '18%', top: '66%', size: 28 },
] as const;

function formatGameDate(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Pestaña de juego: "Llena el termo".
 *
 * Caen gotas y bombas; el jugador mueve el termo (dedo, mouse o flechas)
 * para atrapar las gotas. Cada gota suma 10 puntos y llena el termo; cada
 * 100 puntos se gana una estrella ⭐. Con 3 bombas la partida termina.
 *
 * Hay 6 niveles con temática propia: cada uno se completa al juntar 10
 * estrellas jugando en él y desbloquea el siguiente, que es más rápido.
 * Las skins del termo se desbloquean con el total de estrellas.
 *
 * El ciclo del juego corre con requestAnimationFrame y guarda el estado en
 * una ref; solo forzamos un render por cuadro para dibujar las posiciones.
 */
export default function GameScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const areaHeight = Math.max(340, Math.min(520, windowHeight * 0.58));

  const [status, setStatus] = useState<GameStatus>('ready');
  const [, setFrame] = useState(0);
  const [gameData, setGameData] = useState<GameData>(EMPTY_GAME_DATA);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  const areaWidthRef = useRef(0);
  const gameRef = useRef<GameState>(createGameState(0));
  const gameDataRef = useRef(gameData);
  gameDataRef.current = gameData;

  const level = getLevel(gameData.selectedLevel);
  const selectedSkin = getSkin(gameData.selectedSkin);
  // Si la skin guardada ya no está desbloqueada (p. ej. tras borrar datos), usamos la clásica.
  const skin = gameData.totalStars >= selectedSkin.starsRequired ? selectedSkin : SKINS[0];
  const levelRef = useRef(level);
  levelRef.current = level;

  useEffect(() => {
    getGameData().then(setGameData);
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    areaWidthRef.current = width;
    if (status !== 'playing') {
      gameRef.current.thermosX = width / 2;
      gameRef.current.targetX = width / 2;
      setFrame((f) => f + 1);
    }
  };

  const selectLevel = useCallback((levelId: number) => {
    setGameData((current) => ({ ...current, selectedLevel: levelId }));
    setLastResult(null);
    setStatus('ready');
    saveGameSelection({ selectedLevel: levelId });
  }, []);

  const selectSkin = useCallback((skinId: string) => {
    setGameData((current) => ({ ...current, selectedSkin: skinId }));
    saveGameSelection({ selectedSkin: skinId });
  }, []);

  const startGame = useCallback(() => {
    gameRef.current = createGameState(areaWidthRef.current);
    setLastResult(null);
    setStatus('playing');
  }, []);

  const goToNextLevel = useCallback(
    (levelId: number) => {
      selectLevel(levelId);
      startGame();
    },
    [selectLevel, startGame],
  );

  const finishGame = useCallback(async () => {
    const g = gameRef.current;
    const before = gameDataRef.current;
    const levelId = levelRef.current.id;
    const levelStarsBefore = before.levelStars[levelId] ?? 0;
    const levelCompleted = levelStarsBefore < STARS_PER_LEVEL && levelStarsBefore + g.stars >= STARS_PER_LEVEL;

    setLastResult({
      score: g.score,
      stars: g.stars,
      isRecord: g.score > before.bestScore && g.score > 0,
      levelCompleted,
      nextLevelId: levelCompleted && levelId < LEVELS.length ? levelId + 1 : null,
      newSkins: SKINS.filter(
        (s) => s.starsRequired > before.totalStars && s.starsRequired <= before.totalStars + g.stars,
      ),
    });
    setStatus('over');
    const updated = await saveGameResult({
      score: g.score,
      stars: g.stars,
      dropsCaught: g.dropsCaught,
      level: levelId,
    });
    setGameData(updated);
  }, []);

  // ── Ciclo principal del juego ───────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing') return;

    let rafId = 0;
    let last: number | null = null;

    const step = (now: number) => {
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;

      const g = gameRef.current;
      const theme = levelRef.current;
      const width = areaWidthRef.current;
      const half = GAME.thermosWidth / 2;
      g.elapsed += dt;

      // Movimiento del termo (teclado + seguimiento suave del dedo/mouse)
      if (g.keys.left) g.targetX -= GAME.keyboardSpeed * dt;
      if (g.keys.right) g.targetX += GAME.keyboardSpeed * dt;
      g.targetX = Math.max(half, Math.min(width - half, g.targetX));
      g.thermosX += (g.targetX - g.thermosX) * Math.min(1, dt * 18);

      // Aparición de gotas y bombas: cada vez más seguido y con más bombas
      g.spawnTimerMs -= dt * 1000;
      if (g.spawnTimerMs <= 0 && width > 0) {
        const bombChance = Math.min(GAME.maxBombChance, GAME.startBombChance + g.elapsed * GAME.bombChancePerSecond);
        const margin = GAME.itemSize / 2;
        g.items.push({
          id: g.nextId++,
          kind: Math.random() < bombChance ? 'bomb' : 'drop',
          x: margin + Math.random() * (width - margin * 2),
          y: HUD_HEIGHT - GAME.itemSize,
          speedFactor: 0.85 + Math.random() * 0.35,
          spin: (Math.random() - 0.5) * 120,
        });
        const spawnMs = Math.max(GAME.minSpawnMs, GAME.startSpawnMs - g.elapsed * GAME.spawnMsPerSecond);
        g.spawnTimerMs = spawnMs / theme.speedMultiplier;
      }

      // Caída y colisiones con la boca del termo
      const fallSpeed =
        Math.min(GAME.maxFallSpeed, GAME.startFallSpeed + g.elapsed * GAME.fallSpeedPerSecond) * theme.speedMultiplier;
      const mouthY = areaHeight - THERMOS_BOTTOM_MARGIN - GAME.thermosHeight;
      const remaining: FallingItem[] = [];

      for (const item of g.items) {
        item.y += fallSpeed * item.speedFactor * dt;
        const bottom = item.y + GAME.itemSize / 2;
        const caught =
          bottom >= mouthY &&
          item.y <= mouthY + 24 &&
          Math.abs(item.x - g.thermosX) <= half + GAME.itemSize * 0.2;

        if (caught) {
          if (item.kind === 'drop') {
            g.score += GAME.pointsPerDrop;
            g.dropsCaught += 1;
            g.effects.push({ id: g.nextId++, kind: 'splash', x: item.x, y: mouthY - 10, bornAt: g.elapsed });
            if (g.score % GAME.pointsPerStar === 0) {
              g.stars += 1;
              g.effects.push({ id: g.nextId++, kind: 'star', x: g.thermosX, y: mouthY - 50, bornAt: g.elapsed });

              const levelStarsBefore = gameDataRef.current.levelStars[theme.id] ?? 0;
              if (
                !g.levelAnnounced &&
                levelStarsBefore < STARS_PER_LEVEL &&
                levelStarsBefore + g.stars >= STARS_PER_LEVEL
              ) {
                g.levelAnnounced = true;
                g.effects.push({ id: g.nextId++, kind: 'level', x: width / 2, y: areaHeight * 0.4, bornAt: g.elapsed });
              }
            }
          } else {
            g.bombsHit += 1;
            g.shakeUntil = g.elapsed + 0.35;
            g.effects.push({ id: g.nextId++, kind: 'boom', x: item.x, y: mouthY, bornAt: g.elapsed });
          }
        } else if (item.y < areaHeight + GAME.itemSize) {
          remaining.push(item);
        }
      }
      g.items = remaining;
      g.effects = g.effects.filter((e) => g.elapsed - e.bornAt < EFFECT_DURATION[e.kind]);

      if (g.bombsHit >= GAME.maxBombs) {
        finishGame();
        return;
      }

      setFrame((f) => f + 1);
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, areaHeight, finishGame]);

  // ── Teclado (solo web): flechas o A/D para mover el termo ──────────────
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') gameRef.current.keys.left = pressed;
      else if (key === 'arrowright' || key === 'd') gameRef.current.keys.right = pressed;
      else return;
      if (status === 'playing') event.preventDefault();
    };
    const onDown = (e: KeyboardEvent) => setKey(e, true);
    const onUp = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [status]);

  const moveToTouch = (event: GestureResponderEvent) => {
    gameRef.current.targetX = event.nativeEvent.locationX;
  };

  const g = gameRef.current;
  const fill = (g.score % GAME.pointsPerStar) / GAME.pointsPerStar;
  const shakeX = g.elapsed < g.shakeUntil ? Math.sin(g.elapsed * 90) * 7 : 0;
  const livesLeft = Math.max(GAME.maxBombs - g.bombsHit, 0);
  const levelStarsSaved = gameData.levelStars[level.id] ?? 0;
  const levelProgress = Math.min(levelStarsSaved + (status === 'playing' ? g.stars : 0), STARS_PER_LEVEL);
  const isPlaying = status === 'playing';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={!isPlaying} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Juego 🎮</Text>
            <InfoButton info={INFO.game} />
          </View>
          <View style={styles.headerChips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>⭐ {gameData.totalStars}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🏆 {gameData.bestScore}</Text>
            </View>
          </View>
        </View>

        {/* ── Zona de juego ─────────────────────────────────────────── */}
        <View
          style={[
            styles.areaWrap,
            { height: areaHeight, borderColor: level.accent, transform: [{ translateX: shakeX }] },
          ]}
          onLayout={handleLayout}
        >
          <LinearGradient colors={level.background} style={StyleSheet.absoluteFill} />

          {level.decorations.map((emoji, index) => {
            const spot = DECORATION_SPOTS[index % DECORATION_SPOTS.length];
            const bob = Math.sin(g.elapsed * 1.5 + index * 1.7) * 6;
            return (
              <Text
                key={`${level.id}-${index}`}
                pointerEvents="none"
                style={[
                  styles.decoration,
                  { left: spot.left, top: spot.top, fontSize: spot.size, transform: [{ translateY: bob }] },
                ]}
              >
                {emoji}
              </Text>
            );
          })}
          <View pointerEvents="none" style={[styles.floor, { backgroundColor: level.floor }]} />

          {/* HUD: puntos, avance del nivel y vidas */}
          <View pointerEvents="none" style={styles.hud}>
            <View style={styles.hudBlock}>
              <Text style={styles.hudValue}>{g.score}</Text>
              <Text style={styles.hudLabel}>pts</Text>
            </View>
            <View style={styles.hudCenter}>
              <Text style={styles.hudLevel} numberOfLines={1}>
                {level.emoji} Nivel {level.id}
              </Text>
              <View style={styles.hudTrack}>
                <View style={[styles.hudFill, { width: `${(levelProgress / STARS_PER_LEVEL) * 100}%` }]} />
              </View>
              <Text style={styles.hudLevelStars}>
                ⭐ {levelProgress}/{STARS_PER_LEVEL}
                {isPlaying && g.stars > 0 ? `  (+${g.stars})` : ''}
              </Text>
            </View>
            <View style={[styles.hudBlock, styles.hudRight]}>
              <Text style={styles.hudLives}>
                {'❤️'.repeat(livesLeft)}
                {'🖤'.repeat(GAME.maxBombs - livesLeft)}
              </Text>
            </View>
          </View>

          {g.items.map((item) => (
            <Text
              key={item.id}
              pointerEvents="none"
              style={[
                styles.item,
                {
                  left: item.x - GAME.itemSize / 2,
                  top: item.y - GAME.itemSize / 2,
                  transform: [{ rotate: `${item.kind === 'bomb' ? item.spin * g.elapsed : 0}deg` }],
                },
              ]}
            >
              {item.kind === 'drop' ? level.dropEmoji : level.bombEmoji}
            </Text>
          ))}

          <View
            pointerEvents="none"
            style={[styles.thermosWrap, { left: g.thermosX - GAME.thermosWidth / 2, bottom: THERMOS_BOTTOM_MARGIN }]}
          >
            <Thermos skin={skin} fill={fill} />
          </View>

          {g.effects.map((effect) => {
            const age = (g.elapsed - effect.bornAt) / EFFECT_DURATION[effect.kind];
            if (effect.kind === 'level') {
              return (
                <View
                  key={effect.id}
                  pointerEvents="none"
                  style={[styles.levelBanner, { top: effect.y - 40, opacity: age < 0.8 ? 1 : (1 - age) * 5 }]}
                >
                  <Text style={styles.levelBannerTitle}>🎉 ¡Nivel completado! 🎉</Text>
                  <Text style={styles.levelBannerText}>Sigue jugando para sumar más estrellas</Text>
                </View>
              );
            }
            const label = effect.kind === 'splash' ? '+10' : effect.kind === 'boom' ? '💥' : '⭐ +1';
            return (
              <Text
                key={effect.id}
                pointerEvents="none"
                style={[
                  styles.effect,
                  effect.kind === 'splash' && styles.effectSplash,
                  effect.kind === 'boom' && styles.effectBoom,
                  effect.kind === 'star' && styles.effectStar,
                  {
                    left: effect.x - 50,
                    top: effect.y - 30 - age * 40,
                    opacity: 1 - age,
                    transform: [{ scale: effect.kind === 'splash' ? 1 : 0.8 + age * 0.8 }],
                  },
                ]}
              >
                {label}
              </Text>
            );
          })}

          {isPlaying && (
            <View
              style={StyleSheet.absoluteFill}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={moveToTouch}
              onResponderMove={moveToTouch}
            />
          )}

          {status === 'ready' && (
            <View style={styles.overlay}>
              <Text style={styles.overlayLevelTag}>NIVEL {level.id}</Text>
              <Text style={styles.overlayEmoji}>{level.emoji}</Text>
              <Text style={styles.overlayTitle}>{level.name}</Text>
              <View style={styles.rulesBox}>
                <Text style={styles.overlayRule}>{level.dropEmoji} Atrapa = +10 puntos</Text>
                <Text style={styles.overlayRule}>⭐ Cada 100 puntos = 1 estrella</Text>
                <Text style={styles.overlayRule}>{level.bombEmoji} 3 golpes y pierdes</Text>
                <Text style={styles.overlayRule}>🏁 Junta 10 ⭐ para completar el nivel</Text>
              </View>
              {level.speedMultiplier > 1 && (
                <Text style={styles.speedTag}>⚡ Velocidad ×{level.speedMultiplier.toFixed(2)}</Text>
              )}
              <Pressable onPress={startGame} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
                <Text style={styles.playButtonText}>▶ Jugar</Text>
              </Pressable>
              <Text style={styles.overlayHint}>
                {Platform.OS === 'web' ? 'Arrastra con el mouse o usa las flechas ← →' : 'Arrastra el dedo para mover el termo'}
              </Text>
            </View>
          )}

          {status === 'over' && lastResult && (
            <View style={styles.overlay}>
              <Text style={styles.overlayEmoji}>{lastResult.levelCompleted ? '🎉' : '💥'}</Text>
              <Text style={styles.overlayTitle}>
                {lastResult.levelCompleted ? '¡Nivel completado!' : '¡Fin del juego!'}
              </Text>
              {lastResult.isRecord && <Text style={styles.recordBadge}>🏆 ¡Nuevo récord!</Text>}
              <Text style={styles.resultScore}>{lastResult.score} puntos</Text>
              <Text style={styles.resultStars}>
                {lastResult.stars > 0 ? '⭐'.repeat(Math.min(lastResult.stars, 10)) : 'Sin estrellas esta vez'}
                {lastResult.stars > 10 ? ` ×${lastResult.stars}` : ''}
              </Text>
              {lastResult.nextLevelId !== null && (
                <Text style={styles.unlockText}>
                  🔓 Desbloqueaste: {getLevel(lastResult.nextLevelId).emoji} {getLevel(lastResult.nextLevelId).name}
                </Text>
              )}
              {lastResult.levelCompleted && lastResult.nextLevelId === null && (
                <Text style={styles.unlockText}>🏅 ¡Completaste todos los niveles!</Text>
              )}
              {lastResult.newSkins.map((s) => (
                <Text key={s.id} style={styles.unlockText}>
                  🎨 Nueva skin: {s.emoji} {s.name}
                </Text>
              ))}
              <View style={styles.overlayButtons}>
                <Pressable
                  onPress={startGame}
                  style={({ pressed }) => [
                    styles.playButton,
                    lastResult.nextLevelId !== null && styles.secondaryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.playButtonText}>↻ Repetir</Text>
                </Pressable>
                {lastResult.nextLevelId !== null && (
                  <Pressable
                    onPress={() => goToNextLevel(lastResult.nextLevelId as number)}
                    style={({ pressed }) => [styles.playButton, styles.nextButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.playButtonText}>Nivel {lastResult.nextLevelId} ▶</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* ── Niveles ───────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Niveles 🗺️</Text>
            <Text style={styles.cardHint}>10 ⭐ = nivel completado</Text>
          </View>
          <LevelSelector
            levelStars={gameData.levelStars}
            selectedLevel={level.id}
            disabled={isPlaying}
            onSelect={selectLevel}
          />
        </View>

        {/* ── Skins ─────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Skins del termo 🎨</Text>
            <Text style={styles.cardHint}>Se desbloquean con ⭐</Text>
          </View>
          <SkinSelector
            totalStars={gameData.totalStars}
            selectedSkin={skin.id}
            disabled={isPlaying}
            onSelect={selectSkin}
          />
        </View>

        {/* ── Historial ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mis partidas 🏅</Text>
            <Text style={styles.totalStars}>⭐ {gameData.totalStars} en total</Text>
          </View>
          {gameData.history.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no has jugado. ¡Toma un descanso y prueba! 💧</Text>
          ) : (
            gameData.history.slice(0, 10).map((record) => {
              const isBest = record.score === gameData.bestScore && record.score > 0;
              return (
                <View key={record.id} style={styles.historyRow}>
                  <Text style={styles.historyLevel}>{getLevel(record.level ?? 1).emoji}</Text>
                  <Text style={styles.historyDate}>{formatGameDate(record.timestamp)}</Text>
                  <Text style={styles.historyStars}>⭐ {record.stars}</Text>
                  <Text style={[styles.historyScore, isBest && styles.historyBest]}>
                    {record.score} pts{isBest ? ' 🏆' : ''}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  headerChips: {
    flexDirection: 'row',
  },
  chip: {
    marginLeft: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  areaWrap: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#0B3954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  decoration: {
    position: 'absolute',
    opacity: 0.45,
  },
  floor: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -30,
    height: 64,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HUD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    zIndex: 3,
  },
  hudBlock: {
    width: 74,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hudRight: {
    justifyContent: 'flex-end',
  },
  hudValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  hudLabel: {
    marginLeft: 3,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
  hudCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  hudLevel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hudTrack: {
    marginTop: 2,
    width: '100%',
    maxWidth: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  hudFill: {
    height: '100%',
    backgroundColor: '#FDE047',
  },
  hudLevelStars: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#FEF9C3',
  },
  hudLives: {
    fontSize: 14,
  },
  item: {
    position: 'absolute',
    width: GAME.itemSize,
    height: GAME.itemSize,
    fontSize: GAME.itemSize * 0.8,
    lineHeight: GAME.itemSize,
    textAlign: 'center',
  },
  thermosWrap: {
    position: 'absolute',
    width: GAME.thermosWidth,
    height: GAME.thermosHeight,
  },
  effect: {
    position: 'absolute',
    width: 100,
    textAlign: 'center',
    fontWeight: '900',
  },
  effectSplash: {
    fontSize: 18,
    color: '#A7F3D0',
  },
  effectBoom: {
    fontSize: 42,
  },
  effectStar: {
    fontSize: 26,
    color: '#FDE047',
  },
  levelBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(250, 204, 21, 0.95)',
    alignItems: 'center',
    zIndex: 4,
  },
  levelBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#422006',
  },
  levelBannerText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#713F12',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 5,
  },
  overlayLevelTag: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FDE047',
  },
  overlayEmoji: {
    fontSize: 44,
    marginVertical: 4,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  rulesBox: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  overlayRule: {
    fontSize: 14,
    color: '#E0F2FE',
    marginVertical: 2,
  },
  speedTag: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  overlayHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#99F6E4',
    textAlign: 'center',
  },
  recordBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FDE047',
    marginBottom: 6,
  },
  resultScore: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultStars: {
    marginTop: 6,
    fontSize: 18,
    color: '#FDE047',
  },
  unlockText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800',
    color: '#A7F3D0',
    textAlign: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
  },
  playButton: {
    marginTop: 16,
    marginHorizontal: 5,
    backgroundColor: colors.teal,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderWidth: 2,
    borderColor: '#99F6E4',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  nextButton: {
    backgroundColor: '#EAB308',
    borderColor: '#FEF08A',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.7,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHint: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalStars: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.tealDark,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyLevel: {
    width: 26,
    fontSize: 16,
  },
  historyDate: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyStars: {
    width: 52,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyScore: {
    minWidth: 78,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyBest: {
    color: colors.tealDark,
  },
});
