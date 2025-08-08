import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeLogger } from '../../../utils/safeLogger';

interface StorageHook {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useStorage = (): StorageHook => {
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      safeLogger.error(`[useStorage] Failed to get item with key "${key}":`, error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      safeLogger.error(`[useStorage] Failed to set item with key "${key}":`, error);
      throw error;
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      safeLogger.error(`[useStorage] Failed to remove item with key "${key}":`, error);
      throw error;
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      safeLogger.error('[useStorage] Failed to clear storage:', error);
      throw error;
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
};
