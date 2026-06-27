import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomTabBar, { AppTab } from './src/components/BottomTabBar';
import { DAILY_GOAL_ML } from './src/constants/water';
import { DEFAULT_SETTINGS } from './src/constants/settings';
import { useAppSettings } from './src/hooks/useAppSettings';
import { useDailyGoal } from './src/hooks/useDailyGoal';
import { useUserName } from './src/hooks/useUserName';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StatsScreen from './src/screens/StatsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { cancelAllWaterRemindersAsync, syncWaterReminders } from './src/services/notifications';
import { clearAllEntries } from './src/storage/waterStorage';
import { DailySummary } from './src/types/water';

// Resumen vacío: se usa al reprogramar recordatorios desde App.tsx,
// donde no tenemos acceso al historial del día. Los recordatorios DAILY
// se registran en el OS de todas formas; el cuerpo del mensaje se
// actualiza la próxima vez que HomeScreen calcule el agua restante real.
const EMPTY_SUMMARY: DailySummary = {
  totalMl: 0,
  count: 0,
  drankInMorning: false,
  drankInAfternoonOrNight: false,
};

/**
 * Punto de entrada de AguaDiaria.
 *
 * Aquí viven la meta diaria, la configuración general y el nombre del
 * usuario (a través de `useDailyGoal`, `useAppSettings` y `useUserName`),
 * porque varias pantallas necesitan ver siempre los mismos valores.
 * También decide qué pantalla mostrar: mientras no haya un nombre guardado
 * se muestra la bienvenida (solo la primera vez); después, como la app
 * tiene pocas secciones, basta con una barra inferior simple en lugar de
 * instalar una librería de navegación completa.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const { dailyGoalMl, updateDailyGoal } = useDailyGoal();
  const { settings, updateSettings } = useAppSettings();
  const { userName, isLoadingUserName, saveUserName, resetUserName } = useUserName();

  // Cuando el usuario cambia la hora de recordatorio en Configuración,
  // HomeScreen está desmontado y no puede reprogramar. Este efecto lo hace
  // desde App.tsx para que el cambio surta efecto de inmediato en el celular.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      syncWaterReminders(EMPTY_SUMMARY, settings, dailyGoalMl);
    }
  }, [settings, dailyGoalMl]);

  const handleClearAllData = useCallback(async () => {
    await clearAllEntries();
    await updateDailyGoal(DAILY_GOAL_ML);
    await updateSettings(DEFAULT_SETTINGS);
    // Cancelamos los recordatorios programados con la configuración anterior:
    // si no lo hiciéramos, quedarían "huérfanos" sonando con horarios viejos.
    await cancelAllWaterRemindersAsync();
    // Borramos también el nombre guardado y volvemos a Inicio: así la app
    // queda exactamente como recién instalada, bienvenida incluida.
    await resetUserName();
    setActiveTab('home');
  }, [updateDailyGoal, updateSettings, resetUserName]);

  // Todavía no sabemos si hay un nombre guardado: esperamos antes de decidir
  // qué mostrar, para no hacer parpadear la bienvenida en cada apertura.
  if (isLoadingUserName) {
    return null;
  }

  if (!userName) {
    return (
      <SafeAreaProvider>
        <WelcomeScreen onSubmit={saveUserName} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {activeTab === 'home' && (
          <HomeScreen dailyGoalMl={dailyGoalMl} settings={settings} userName={userName} />
        )}
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
