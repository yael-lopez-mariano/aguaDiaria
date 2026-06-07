import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { getSettings, setSettings } from '../storage/settingsStorage';
import { AppSettings } from '../types/settings';

/**
 * Hook que carga la configuración guardada (notificaciones y horarios de
 * recordatorio) al iniciar la app, y expone una función para reemplazarla
 * y guardarla de inmediato. Vive en App para que tanto la pantalla
 * principal (que sincroniza los recordatorios) como la de Configuración
 * trabajen siempre con el mismo valor.
 */
export function useAppSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedSettings = await getSettings();
      setSettingsState(storedSettings);
      setIsLoading(false);
    })();
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    await setSettings(newSettings);
  }, []);

  return { settings, isLoadingSettings: isLoading, updateSettings };
}
