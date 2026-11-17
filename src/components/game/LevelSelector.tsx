import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { isLevelUnlocked, LEVELS, STARS_PER_LEVEL } from '../../constants/gameThemes';

interface LevelSelectorProps {
  levelStars: Record<number, number>;
  selectedLevel: number;
  disabled: boolean;
  onSelect: (levelId: number) => void;
}

/**
 * Mapa de niveles: una tarjeta por nivel con su temática, el avance de
 * estrellas (x/10) y un candado si todavía no se desbloquea.
 */
export default function LevelSelector({ levelStars, selectedLevel, disabled, onSelect }: LevelSelectorProps) {
  return (
    <View style={styles.grid}>
      {LEVELS.map((level) => {
        const unlocked = isLevelUnlocked(level.id, levelStars);
        const stars = Math.min(levelStars[level.id] ?? 0, STARS_PER_LEVEL);
        const completed = stars >= STARS_PER_LEVEL;
        const selected = level.id === selectedLevel;

        return (
          <Pressable
            key={level.id}
            disabled={!unlocked || disabled}
            onPress={() => onSelect(level.id)}
            style={({ pressed }) => [
              styles.card,
              selected && styles.cardSelected,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient colors={level.background} style={styles.cardGradient}>
              <View style={styles.cardTop}>
                <Text style={styles.levelNumber}>Nivel {level.id}</Text>
                {completed && <Text style={styles.completedBadge}>✓</Text>}
              </View>
              <Text style={styles.levelEmoji}>{level.emoji}</Text>
              <Text style={styles.levelName} numberOfLines={1}>
                {level.name}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(stars / STARS_PER_LEVEL) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                ⭐ {stars}/{STARS_PER_LEVEL}
              </Text>

              {!unlocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                  <Text style={styles.lockText}>Completa el nivel {level.id - 1}</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.teal,
  },
  pressed: {
    opacity: 0.8,
  },
  cardGradient: {
    padding: 10,
    minHeight: 132,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: colors.success,
    width: 20,
    height: 20,
    lineHeight: 20,
    borderRadius: 10,
    textAlign: 'center',
    overflow: 'hidden',
  },
  levelEmoji: {
    fontSize: 30,
    marginVertical: 4,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FDE047',
  },
  progressText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  lockEmoji: {
    fontSize: 26,
  },
  lockText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
});
