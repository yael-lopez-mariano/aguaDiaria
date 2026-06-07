import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

export type AppTab = 'home' | 'stats' | 'history' | 'settings';

interface BottomTabBarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
}

interface TabButtonProps {
  label: string;
  emoji: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, emoji, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabEmoji, isActive && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Barra inferior simple para moverse entre las secciones de la app.
 * Como son pocas, basta con guardar cuál está activa en lugar de
 * añadir una librería de navegación completa.
 */
export default function BottomTabBar({ activeTab, onChangeTab }: BottomTabBarProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <TabButton
          label="Inicio"
          emoji="🏠"
          isActive={activeTab === 'home'}
          onPress={() => onChangeTab('home')}
        />
        <TabButton
          label="Estadísticas"
          emoji="📊"
          isActive={activeTab === 'stats'}
          onPress={() => onChangeTab('stats')}
        />
        <TabButton
          label="Historial"
          emoji="🕒"
          isActive={activeTab === 'history'}
          onPress={() => onChangeTab('history')}
        />
        <TabButton
          label="Ajustes"
          emoji="⚙️"
          isActive={activeTab === 'settings'}
          onPress={() => onChangeTab('settings')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.card,
  },
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
});
