/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/storage';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
}

interface UiState {
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  toasts: ToastNotification[];
  soundEnabled: boolean;
  digestEnabled: boolean;
  syncEnabled: boolean;
  
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setThemeMode: (theme: 'light' | 'dark') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDigestEnabled: (enabled: boolean) => void;
  setSyncEnabled: (enabled: boolean) => void;
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      themeMode: 'dark', // Default to clean, elegant off-white / charcoal crisp slate theme
      toasts: [],
      soundEnabled: true,
      digestEnabled: true,
      syncEnabled: true,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      toggleTheme: () => set((state) => {
        const nextTheme = state.themeMode === 'light' ? 'dark' : 'light';
        return { themeMode: nextTheme };
      }),

      setThemeMode: (theme) => set({ themeMode: theme }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setDigestEnabled: (enabled) => set({ digestEnabled: enabled }),
      setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),

      addToast: (title, message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastNotification = { id, title, message, type, createdAt: new Date() };
        set((state) => ({ toasts: [newToast, ...state.toasts].slice(0, 5) })); // Keep up to 5 toasts
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 4000);
      },

      dismissToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      clearAllToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'deadlinezero-ui',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        themeMode: state.themeMode,
        soundEnabled: state.soundEnabled,
        digestEnabled: state.digestEnabled,
        syncEnabled: state.syncEnabled,
      }),
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
    }
  )
);
