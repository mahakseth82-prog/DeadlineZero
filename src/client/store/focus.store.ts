/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/storage';

export type AmbientSoundType = 'none' | 'rain' | 'waves' | 'brown_noise' | 'synth';

export interface FocusSessionLog {
  id: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
}

const INITIAL_COMPLETED_SESSIONS: FocusSessionLog[] = [
  {
    id: 'fs-1',
    taskTitle: 'Model Database Entity Relational diagrams',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fs-2',
    taskTitle: 'Complete Hackathon MVP Core Architecture',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

interface FocusState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  totalSessionDuration: number; // in seconds (25 mins = 1500 secs)
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  ambientSound: AmbientSoundType;
  isAudioPlaying: boolean;
  completedSessions: FocusSessionLog[];
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setTimeRemaining: (seconds: number) => void;
  linkTask: (taskId: string | null, title: string | null) => void;
  setAmbientSound: (sound: AmbientSoundType) => void;
  toggleAudio: () => void;
  clearCompletedSessions: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      timeRemaining: 25 * 60, // Default 25 minutes
      totalSessionDuration: 25 * 60,
      activeTaskId: null,
      activeTaskTitle: null,
      ambientSound: 'none',
      isAudioPlaying: false,
      completedSessions: INITIAL_COMPLETED_SESSIONS,

      startTimer: () => set({ isRunning: true }),
      
      pauseTimer: () => set({ isRunning: false }),
      
      resetTimer: () => set((state) => ({
        isRunning: false,
        timeRemaining: state.totalSessionDuration,
        isAudioPlaying: false,
      })),

      tick: () => {
        const { timeRemaining, isRunning, activeTaskTitle, totalSessionDuration, completedSessions } = get();
        if (isRunning && timeRemaining > 1) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isRunning && timeRemaining === 1) {
          const durationMinutes = Math.round(totalSessionDuration / 60) || 25;
          const title = activeTaskTitle || 'General Focus Block';
          const newSession: FocusSessionLog = {
            id: `fs-${Date.now()}`,
            taskTitle: title,
            durationMinutes,
            completedAt: new Date().toISOString(),
          };
          set({
            isRunning: false,
            timeRemaining: 0,
            completedSessions: [newSession, ...completedSessions],
          });
        }
      },

      setTimeRemaining: (seconds) => set({ 
        timeRemaining: seconds,
        totalSessionDuration: seconds,
      }),

      linkTask: (taskId, title) => set({ 
        activeTaskId: taskId,
        activeTaskTitle: title,
      }),

      setAmbientSound: (sound) => set({ 
        ambientSound: sound,
        isAudioPlaying: sound !== 'none'
      }),

      toggleAudio: () => set((state) => ({ 
        isAudioPlaying: state.ambientSound !== 'none' ? !state.isAudioPlaying : false 
      })),

      clearCompletedSessions: () => set({ completedSessions: [] }),
    }),
    {
      name: 'deadlinezero-focus',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
    }
  )
);
