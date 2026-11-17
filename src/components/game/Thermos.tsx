import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GAME } from '../../constants/game';
import { ThermosSkin } from '../../constants/gameThemes';

interface ThermosProps {
  skin: ThermosSkin;
  /** Qué tan lleno está, de 0 a 1. */
  fill: number;
}

const INNER_HEIGHT = GAME.thermosHeight - 30;

/** El termo del jugador, con la tapa abierta y el agua visible por una ventanita. */
export default function Thermos({ skin, fill }: ThermosProps) {
  return (
    <View style={styles.thermos} pointerEvents="none">
      <View style={[styles.lid, { backgroundColor: skin.lid, borderColor: skin.border }]} />
      <View style={[styles.mouth, { backgroundColor: skin.mouth, borderColor: skin.border }]} />
      <LinearGradient
        colors={skin.body}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.body, { borderColor: skin.border }]}
      >
        <View style={styles.window}>
          <View style={{ width: '100%', height: INNER_HEIGHT * Math.min(Math.max(fill, 0), 1) }}>
            <LinearGradient colors={skin.water} style={StyleSheet.absoluteFill} />
          </View>
        </View>
        <View style={styles.stripe} />
        {skin.badge && <Text style={styles.badge}>{skin.badge}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  thermos: {
    width: GAME.thermosWidth,
    height: GAME.thermosHeight,
  },
  lid: {
    position: 'absolute',
    top: -6,
    right: -14,
    width: 30,
    height: 14,
    borderRadius: 6,
    borderWidth: 2,
    transform: [{ rotate: '35deg' }],
  },
  mouth: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 12,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 2,
  },
  body: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  window: {
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
  stripe: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 12,
  },
});
