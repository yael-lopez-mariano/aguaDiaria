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
import { colors } from '../constants/colors';
import { GAME } from '../constants/game';
import { INFO } from '../constants/info';
import { EMPTY_GAME_DATA, GameData, getGameData, saveGameResult } from '../storage/gameStorage';

type GameStatus = 'ready' | 'playing' | 'over';

interface FallingItem {
  id: number;
  kind: 'drop' | 'bomb';
  x: number;
  y: number;
  speedFactor: number;
}

interface Effect {
  id: number;
  kind: 'splash' | 'boom' | 'star';
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
  keys: { left: boolean; right: boolean };
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
    keys: { left: false, right: false },
  };
}

const EFFECT_DURATION = 0.8;
const THERMOS_BOTTOM_MARGIN = 10;

function formatGameDate(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** El termo que maneja el jugador; el agua dentro sube con cada gota atrapada. */
function Thermos({ fill }: { fill: number }) {
  const innerHeight = GAME.thermosHeight - 30;
  return (
    <View style={styles.thermos} pointerEvents="none">
      {/* Tapa abierta, inclinada a un lado */}
      <View style={styles.thermosLid} />
      {/* Boca del termo */}
      <View style={styles.thermosMouth} />
      <LinearGradient
        colors={['#0D9488', '#5EEAD4', '#14B8A6', '#0D9488']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.thermosBody}
      >
        <View style={styles.thermosWindow}>
          <View style={[styles.thermosWaterWrap, { height: innerHeight * fill }]}>
            <LinearGradient colors={['#7FC8FF', '#2F9BFF']} style={StyleSheet.absoluteFill} />
          </View>
        </View>
        <View style={styles.thermosStripe} />
      </LinearGradient>
    </View>
  );
}

/**
 * Pestaña de juego: "Llena el termo".
 *
 * Caen gotas 💧 y bombas 💣; el jugador mueve el termo (arrastrando el dedo,
 * con el mouse o con las flechas del teclado) para atrapar las gotas.
 * Cada gota suma 10 puntos y llena el termo; al llegar a 100 puntos el termo
 * se llena, se gana una estrella ⭐ y vuelve a vaciarse. Con 3 bombas
 * atrapadas la partida termina y se guarda en el historial.
 *
 * El ciclo del juego corre con requestAnimationFrame y guarda el estado en
 * una ref para no recrear objetos en cada cuadro; solo forzamos un render
 * por cuadro para dibujar las posiciones nuevas.
 */
export default function GameScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const areaHeight = Math.max(320, Math.min(500, windowHeight * 0.55));

  const [status, setStatus] = useState<GameStatus>('ready');
  const [, setFrame] = useState(0);
  const [gameData, setGameData] = useState<GameData>(EMPTY_GAME_DATA);
  const [lastResult, setLastResult] = useState<{ score: number; stars: number; isRecord: boolean } | null>(null);

  const areaWidthRef = useRef(0);
  const gameRef = useRef<GameState>(createGameState(0));
  const gameDataRef = useRef(gameData);
  gameDataRef.current = gameData;

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

  const startGame = useCallback(() => {
    gameRef.current = createGameState(areaWidthRef.current);
    setLastResult(null);
    setStatus('playing');
  }, []);

  const finishGame = useCallback(async () => {
    const g = gameRef.current;
    const previousBest = gameDataRef.current.bestScore;
    setLastResult({ score: g.score, stars: g.stars, isRecord: g.score > previousBest && g.score > 0 });
    setStatus('over');
    const updated = await saveGameResult({ score: g.score, stars: g.stars, dropsCaught: g.dropsCaught });
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
          y: -GAME.itemSize,
          speedFactor: 0.85 + Math.random() * 0.35,
        });
        g.spawnTimerMs = Math.max(GAME.minSpawnMs, GAME.startSpawnMs - g.elapsed * GAME.spawnMsPerSecond);
      }

      // Caída y colisiones con la boca del termo
      const fallSpeed = Math.min(GAME.maxFallSpeed, GAME.startFallSpeed + g.elapsed * GAME.fallSpeedPerSecond);
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
      g.effects = g.effects.filter((e) => g.elapsed - e.bornAt < EFFECT_DURATION);

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

  // ── Toque / arrastre ───────────────────────────────────────────────────
  const moveToTouch = (event: GestureResponderEvent) => {
    gameRef.current.targetX = event.nativeEvent.locationX;
  };

  const g = gameRef.current;
  const fill = (g.score % GAME.pointsPerStar) / GAME.pointsPerStar;
  const shakeX = g.elapsed < g.shakeUntil ? Math.sin(g.elapsed * 90) * 7 : 0;
  const livesLeft = GAME.maxBombs - g.bombsHit;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled={status !== 'playing'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Juego 🎮</Text>
            <InfoButton info={INFO.game} />
          </View>
          <Text style={styles.subtitle}>Atrapa las gotas, esquiva las bombas y llena el termo</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{g.score}</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{g.stars} ⭐</Text>
            <Text style={styles.statLabel}>Estrellas</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{gameData.bestScore}</Text>
            <Text style={styles.statLabel}>Récord</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>
              {'❤️'.repeat(Math.max(livesLeft, 0))}
              {'🖤'.repeat(GAME.maxBombs - Math.max(livesLeft, 0))}
            </Text>
            <Text style={styles.statLabel}>Vidas</Text>
          </View>
        </View>

        <View
          style={[styles.areaWrap, { height: areaHeight, transform: [{ translateX: shakeX }] }]}
          onLayout={handleLayout}
        >
          <LinearGradient colors={['#0B3954', '#1565C0', '#1E96D8']} style={StyleSheet.absoluteFill} />
          {/* Burbujas decorativas del fondo */}
          <View pointerEvents="none" style={[styles.decoBubble, { left: '12%', top: '20%', width: 18, height: 18 }]} />
          <View pointerEvents="none" style={[styles.decoBubble, { left: '78%', top: '35%', width: 26, height: 26 }]} />
          <View pointerEvents="none" style={[styles.decoBubble, { left: '45%', top: '60%', width: 12, height: 12 }]} />
          <View pointerEvents="none" style={[styles.decoBubble, { left: '25%', top: '75%', width: 20, height: 20 }]} />
          <View pointerEvents="none" style={styles.floor} />

          {g.items.map((item) => (
            <Text
              key={item.id}
              pointerEvents="none"
              style={[
                styles.item,
                { left: item.x - GAME.itemSize / 2, top: item.y - GAME.itemSize / 2 },
              ]}
            >
              {item.kind === 'drop' ? '💧' : '💣'}
            </Text>
          ))}

          <View
            pointerEvents="none"
            style={[
              styles.thermosWrap,
              { left: g.thermosX - GAME.thermosWidth / 2, bottom: THERMOS_BOTTOM_MARGIN },
            ]}
          >
            <Thermos fill={fill} />
          </View>

          {g.effects.map((effect) => {
            const age = (g.elapsed - effect.bornAt) / EFFECT_DURATION;
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

          {status === 'playing' && (
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
              <Text style={styles.overlayEmoji}>💧 ⭐ 💧</Text>
              <Text style={styles.overlayTitle}>¡Llena el termo!</Text>
              <Text style={styles.overlayRule}>💧 Gota = +10 puntos</Text>
              <Text style={styles.overlayRule}>⭐ Cada 100 puntos = 1 estrella</Text>
              <Text style={styles.overlayRule}>💣 3 bombas y pierdes</Text>
              <Text style={styles.overlayHint}>
                {Platform.OS === 'web' ? 'Arrastra con el mouse o usa las flechas ← →' : 'Arrastra el dedo para mover el termo'}
              </Text>
              <Pressable onPress={startGame} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
                <Text style={styles.playButtonText}>▶ Jugar</Text>
              </Pressable>
            </View>
          )}

          {status === 'over' && lastResult && (
            <View style={styles.overlay}>
              <Text style={styles.overlayEmoji}>💥</Text>
              <Text style={styles.overlayTitle}>¡Fin del juego!</Text>
              {lastResult.isRecord && <Text style={styles.recordBadge}>🏆 ¡Nuevo récord!</Text>}
              <Text style={styles.resultScore}>{lastResult.score} puntos</Text>
              <Text style={styles.resultStars}>
                {lastResult.stars > 0 ? '⭐'.repeat(Math.min(lastResult.stars, 10)) : 'Sin estrellas esta vez'}
                {lastResult.stars > 10 ? ` ×${lastResult.stars}` : ''}
              </Text>
              <Pressable onPress={startGame} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
                <Text style={styles.playButtonText}>↻ Jugar de nuevo</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mis partidas 🏅</Text>
            <Text style={styles.totalStars}>⭐ {gameData.totalStars} en total</Text>
          </View>
          {gameData.history.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no has jugado. ¡Toma un descanso y prueba! 💧</Text>
          ) : (
            gameData.history.slice(0, 10).map((record) => (
              <View key={record.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{formatGameDate(record.timestamp)}</Text>
                <Text style={styles.historyStars}>⭐ {record.stars}</Text>
                <Text style={[styles.historyScore, record.score === gameData.bestScore && record.score > 0 && styles.historyBest]}>
                  {record.score} pts{record.score === gameData.bestScore && record.score > 0 ? ' 🏆' : ''}
                </Text>
              </View>
            ))
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
    paddingHorizontal: 24,
    paddingTop: 12,
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
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  statPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    marginTop: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  areaWrap: {
    marginHorizontal: 16,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.tealLight,
  },
  decoBubble: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  floor: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -30,
    height: 60,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(45, 212, 191, 0.35)',
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
  thermos: {
    width: GAME.thermosWidth,
    height: GAME.thermosHeight,
  },
  thermosLid: {
    position: 'absolute',
    top: -6,
    right: -14,
    width: 30,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#0D9488',
    borderWidth: 2,
    borderColor: '#99F6E4',
    transform: [{ rotate: '35deg' }],
  },
  thermosMouth: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#083344',
    borderWidth: 2,
    borderColor: '#99F6E4',
    zIndex: 2,
  },
  thermosBody: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CCFBF1',
    overflow: 'hidden',
  },
  thermosWindow: {
    position: 'absolute',
    top: 14,
    bottom: 10,
    left: 14,
    right: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  thermosWaterWrap: {
    width: '100%',
  },
  thermosStripe: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 57, 84, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlayEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  overlayRule: {
    fontSize: 15,
    color: '#E0F2FE',
    marginVertical: 2,
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
  playButton: {
    marginTop: 18,
    backgroundColor: colors.teal,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#99F6E4',
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
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
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
  historyDate: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyStars: {
    width: 56,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyScore: {
    minWidth: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyBest: {
    color: colors.tealDark,
  },
});
