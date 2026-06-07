import AsyncStorage from '@react-native-async-storage/async-storage';

/** Llave bajo la que se guarda el nombre que el usuario da al abrir la app por primera vez. */
const USER_NAME_STORAGE_KEY = '@aguadiaria:userName';

/** Lee el nombre guardado, o `null` si todavía no se ha pedido (primer arranque). */
export async function getUserName(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(USER_NAME_STORAGE_KEY);
    return stored && stored.trim().length > 0 ? stored : null;
  } catch (error) {
    console.warn('No se pudo leer el nombre guardado:', error);
    return null;
  }
}

/** Guarda el nombre que el usuario escribió en la bienvenida. */
export async function setUserName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_NAME_STORAGE_KEY, name.trim());
  } catch (error) {
    console.warn('No se pudo guardar el nombre del usuario:', error);
  }
}

/** Borra el nombre guardado (usado al "borrar todos los datos", para volver a pedirlo). */
export async function clearUserName(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_NAME_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo borrar el nombre guardado:', error);
  }
}
