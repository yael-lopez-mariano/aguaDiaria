import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomTabBar, { AppTab } from './src/components/BottomTabBar';
import { DAILY_GOAL_ML } from './src/constants/water';
import { DEFAULT_SETTINGS } from './src/constants/settings';
import { useAppSettings } from './src/hooks/useAppSettings';
import { useDailyGoal } from './src/hooks/useDailyGoal';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StatsScreen from './src/screens/StatsScreen';
import { clearAllEntries } from './src/storage/waterStorage';

/**
 * Punto de entrada de AguaDiaria.
 *
 * Aquí viven la meta diaria y la configuración general (a través de
 * `useDailyGoal` y `useAppSettings`), porque varias pantallas necesitan
 * ver siempre los mismos valores. También decide qué pantalla mostrar:
 * como la app tiene pocas secciones, basta con una barra inferior simple
 * en lugar de instalar una librería de navegación completa.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const { dailyGoalMl, updateDailyGoal } = useDailyGoal();
  const { settings, updateSettings } = useAppSettings();

  const handleClearAllData = useCallback(async () => {
    await clearAllEntries();
    await updateDailyGoal(DAILY_GOAL_ML);
    await updateSettings(DEFAULT_SETTINGS);
  }, [updateDailyGoal, updateSettings]);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {activeTab === 'home' && <HomeScreen dailyGoalMl={dailyGoalMl} settings={settings} />}
        {activeTab === 'stats' && (
          <StatsScreen dailyGoalMl={dailyGoalMl} onChangeGoal={updateDailyGoal} />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            dailyGoalMl={dailyGoalMl}
            onChangeGoal={updateDailyGoal}
            settings={settings}
            onChangeSettings={updateSettings}
            onClearAllData={handleClearAllData}
          />
        )}
        <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
