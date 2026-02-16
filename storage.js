import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  CHARACTER_DATA: 'character_data',
  USER_ID: 'user_id',
  API_KEYS: 'api_keys',
  DARK_MODE: 'dark_mode',
  SHARED_SHEET: 'shared_sheet',
};

// Guardar datos de forma segura
export async function saveSecure(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(key, stringValue);
    } else {
      await SecureStore.setItemAsync(key, stringValue);
    }
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
}

// Obtener datos seguros
export async function getSecure(key) {
  try {
    let value;
    
    if (Platform.OS === 'web') {
      value = localStorage.getItem(key);
    } else {
      value = await SecureStore.getItemAsync(key);
    }
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
}

// Eliminar datos
export async function deleteSecure(key) {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
  }
}

// Funciones específicas del juego
export const storage = {
  // Guardar personaje
  saveCharacter: async (characterData) => {
    await saveSecure(STORAGE_KEYS.CHARACTER_DATA, characterData);
  },

  // Cargar personaje
  loadCharacter: async () => {
    return await getSecure(STORAGE_KEYS.CHARACTER_DATA);
  },

  // Guardar User ID
  saveUserId: async (userId) => {
    await saveSecure(STORAGE_KEYS.USER_ID, userId);
  },

  // Obtener User ID
  getUserId: async () => {
    return await getSecure(STORAGE_KEYS.USER_ID);
  },

  // Guardar API Keys
  saveAPIKeys: async (keys) => {
    await saveSecure(STORAGE_KEYS.API_KEYS, keys);
  },

  // Obtener API Keys
  getAPIKeys: async () => {
    return await getSecure(STORAGE_KEYS.API_KEYS);
  },

  // Guardar preferencia dark mode
  saveDarkMode: async (isDark) => {
    await saveSecure(STORAGE_KEYS.DARK_MODE, isDark);
  },

  // Obtener dark mode
  getDarkMode: async () => {
    return await getSecure(STORAGE_KEYS.DARK_MODE);
  },

  // Guardar Sheet ID compartido
  saveSharedSheet: async (sheetId) => {
    await saveSecure(STORAGE_KEYS.SHARED_SHEET, sheetId);
  },

  // Obtener Sheet ID compartido
  getSharedSheet: async () => {
    return await getSecure(STORAGE_KEYS.SHARED_SHEET);
  },

  // Limpiar todos los datos
  clearAll: async () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      await deleteSecure(key);
    }
  },
};
