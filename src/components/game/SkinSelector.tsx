import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { SKINS } from '../../constants/gameThemes';
import Thermos from './Thermos';

interface SkinSelectorProps {
  totalStars: number;
  selectedSkin: string;
  disabled: boolean;
  onSelect: (skinId: string) => void;
}

/** Fila deslizable con las skins del termo; las bloqueadas muestran cuántas estrellas faltan. */
export default function SkinSelector({ totalStars, selectedSkin, disabled, onSelect }: SkinSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {SKINS.map((skin) => {
        const unlocked = totalStars >= skin.starsRequired;
        const selected = skin.id === selectedSkin;
        return (
          <Pressable
            key={skin.id}
            disabled={!unlocked || disabled}
            onPress={() => onSelect(skin.id)}
            style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
          >
            <View style={[styles.preview, !unlocked && styles.previewLocked]}>
              <View style={styles.previewScale}>
                <Thermos skin={skin} fill={0.6} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {skin.emoji} {skin.name}
            </Text>
            {selected ? (
              <Text style={[styles.status, styles.statusSelected]}>✓ En uso</Text>
            ) : unlocked ? (
              <Text style={styles.status}>Usar</Text>
            ) : (
              <Text style={[styles.status, styles.statusLocked]}>🔒 {skin.starsRequired} ⭐</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 4,
  },
  card: {
    width: 100,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#CCFBF1',
  },
  pressed: {
    opacity: 0.75,
  },
  preview: {
    width: 70,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLocked: {
    opacity: 0.35,
  },
  previewScale: {
    transform: [{ scale: 0.8 }],
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  status: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statusSelected: {
    color: colors.tealDark,
  },
  statusLocked: {
    color: '#B45309',
  },
});
