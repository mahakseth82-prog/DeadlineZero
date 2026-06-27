/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { StateStorage } from 'zustand/middleware';

/**
 * A robust storage adapter for Zustand persistence that wraps localStorage.
 * It handles errors gracefully, prevents crashes on corrupted JSON or blocked storage,
 * and cleans up corrupted keys.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = window.localStorage.getItem(name);
      if (!value) return null;
      // Validate that it's parseable JSON
      JSON.parse(value);
      return value;
    } catch (error) {
      console.error(`[Storage] Error reading or parsing key "${name}" from localStorage:`, error);
      // Clean up corrupted item so it doesn't block future writes
      try {
        window.localStorage.removeItem(name);
      } catch (e) {
        // Safe fallback if removeItem fails
      }
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      window.localStorage.setItem(name, value);
    } catch (error) {
      console.error(`[Storage] Error writing key "${name}" to localStorage:`, error);
    }
  },

  removeItem: (name: string): void => {
    try {
      window.localStorage.removeItem(name);
    } catch (error) {
      console.error(`[Storage] Error removing key "${name}" from localStorage:`, error);
    }
  },
};
