import { useCallback, useEffect, useState } from 'react';
import { clearUserName, getUserName, setUserName } from '../storage/userStorage';

/**
 * Hook que carga el nombre guardado del usuario (si ya lo dio en la
 * bienvenida) y expone funciones para guardarlo o borrarlo.
 *
 * Mientras `isLoadingUserName` es `true` todavía no sabemos si hay un
 * nombre guardado: App espera a que termine antes de decidir si debe
 * mostrar la bienvenida o la app normal, para no hacerla parpadear.
 */
export function useUserName() {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedName = await getUserName();
      setUserNameState(storedName);
      setIsLoading(false);
    })();
  }, []);

  const saveUserName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserNameState(trimmed);
    await setUserName(trimmed);
  }, []);

  const resetUserName = useCallback(async () => {
    setUserNameState(null);
    await clearUserName();
  }, []);

  return { userName, isLoadingUserName: isLoading, saveUserName, resetUserName };
}
