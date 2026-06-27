/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/storage';

interface RecoveryStep {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

interface PanicSessionLog {
  id: string;
  taskId: string;
  taskTitle: string;
  completedAt: string;
}

const INITIAL_COMPLETED_PANICS: PanicSessionLog[] = [
  {
    id: 'cp-1',
    taskId: 'task-3',
    taskTitle: 'Review Google OAuth Token refresh cycle',
    completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cp-2',
    taskId: 'task-other',
    taskTitle: 'Draft proposal technical abstract draft',
    completedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  }
];

interface PanicState {
  isActive: boolean;
  taskId: string | null;
  taskTitle: string | null;
  secondsRemaining: number;
  recoveryPlan: RecoveryStep[];
  completedPanics: PanicSessionLog[];
  
  // Actions
  triggerPanic: (taskId: string, taskTitle: string, durationHours: number, steps: { title: string, durationMinutes: number }[]) => void;
  tickPanicTimer: () => void;
  toggleStep: (stepId: string) => void;
  resolvePanic: () => void;
  cancelPanic: () => void;
  clearCompletedPanics: () => void;
}

export const usePanicStore = create<PanicState>()(
  persist(
    (set) => ({
      isActive: false,
      taskId: null,
      taskTitle: null,
      secondsRemaining: 0,
      recoveryPlan: [],
      completedPanics: INITIAL_COMPLETED_PANICS,

      triggerPanic: (taskId, taskTitle, durationHours, steps) => {
        const formattedSteps = steps.map((s, index) => ({
          id: `step-${index}-${Date.now()}`,
          title: s.title,
          durationMinutes: s.durationMinutes,
          completed: false,
        }));

        set({
          isActive: true,
          taskId,
          taskTitle,
          secondsRemaining: durationHours * 60 * 60,
          recoveryPlan: formattedSteps,
        });
      },

      tickPanicTimer: () => set((state) => {
        if (!state.isActive) return {};
        return {
          secondsRemaining: Math.max(0, state.secondsRemaining - 1),
        };
      }),

      toggleStep: (stepId) => set((state) => ({
        recoveryPlan: state.recoveryPlan.map((step) =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        ),
      })),

      resolvePanic: () => set((state) => {
        const newPanicLog: PanicSessionLog | null = state.taskId ? {
          id: `cp-${Date.now()}`,
          taskId: state.taskId,
          taskTitle: state.taskTitle || 'Emergency Sprint Task',
          completedAt: new Date().toISOString(),
        } : null;

        return {
          isActive: false,
          taskId: null,
          taskTitle: null,
          secondsRemaining: 0,
          recoveryPlan: [],
          completedPanics: newPanicLog ? [newPanicLog, ...state.completedPanics] : state.completedPanics,
        };
      }),

      cancelPanic: () => set({
        isActive: false,
        taskId: null,
        taskTitle: null,
        secondsRemaining: 0,
        recoveryPlan: [],
      }),

      clearCompletedPanics: () => set({ completedPanics: [] }),
    }),
    {
      name: 'deadlinezero-panic',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
    }
  )
);
