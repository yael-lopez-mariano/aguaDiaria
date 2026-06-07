import { useCallback, useEffect, useState } from 'react';
import { DAILY_GOAL_ML } from '../constants/water';
import { getDailyGoal, setDailyGoal } from '../storage/goalStorage';

/**
 * Hook que carga la meta diaria guardada (o la meta por defecto la primera
 * vez) y expone una función para cambiarla. Vive en App para que tanto la
 * pantalla principal como la de Estadísticas trabajen siempre con el mismo
 * valor, sin que cada una guarde su propia copia desincronizada.
 */
export function useDailyGoal() {
  const [dailyGoalMl, setDailyGoalMl] = useState(DAILY_GOAL_ML);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedGoal = await getDailyGoal();
      setDailyGoalMl(storedGoal);
      setIsLoading(false);
    })();
  }, []);

  const updateDailyGoal = useCallback(async (newGoalMl: number) => {
    setDailyGoalMl(newGoalMl);
    await setDailyGoal(newGoalMl);
  }, []);

  return { dailyGoalMl, isLoadingGoal: isLoading, updateDailyGoal };
}
