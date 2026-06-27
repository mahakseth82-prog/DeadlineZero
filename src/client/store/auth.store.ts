/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../../types';
import { safeLocalStorage } from '../utils/storage';
import { AuthService } from "../services/auth.service";

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
 login: (email: string, password: string) => Promise<boolean>;
signup: (
  fullName: string,
  email: string,
  password: string
) => Promise<boolean>;
googleLogin: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboarded: (status: boolean) => void;
}

const DEFAULT_MOCK_PROFILE: UserProfile = {
  id: 'usr-928374',
  userId: 'usr-928374',
  email: 'mahakseth82@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
  bio: 'Computer Science student and freelance web developer.',
  occupation: 'Student / Freelancer',
  goals: ['Avoid missing project deadlines', 'Optimize deep focus patterns', 'Succeed in hackathon demos'],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  productivityScore: 78,
  focusScore: 84,
  timezone: 'America/Los_Angeles',
  currentStreak: 5,
  longestStreak: 12,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
     accessToken: null,
user: null,
isAuthenticated: false,
isOnboarded: false,
     login: async (email: string, password: string) => {
  try {
    const firebaseUser = await AuthService.login(email, password);

    set({
      accessToken: await firebaseUser.getIdToken(),
      user: {
        ...DEFAULT_MOCK_PROFILE,
        id: firebaseUser.uid,
        userId: firebaseUser.uid,
        email: firebaseUser.email ?? email,
      },
      isAuthenticated: true,
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
},

      signup: async (
  fullName: string,
  email: string,
  password: string
) => {
  try {
    const firebaseUser = await AuthService.signup(
      fullName,
      email,
      password
    );

    set({
      accessToken: await firebaseUser.getIdToken(),
      user: {
        ...DEFAULT_MOCK_PROFILE,
        id: firebaseUser.uid,
        userId: firebaseUser.uid,
        email: firebaseUser.email ?? email,
        currentStreak: 0,
        longestStreak: 0,
        productivityScore: 0,
        focusScore: 0,
      },
      isAuthenticated: true,
      isOnboarded: false,
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
},
googleLogin: async () => {
  try {
    const firebaseUser = await AuthService.googleLogin();

    set({
      accessToken: await firebaseUser.getIdToken(),
      user: {
        ...DEFAULT_MOCK_PROFILE,
        id: firebaseUser.uid,
        userId: firebaseUser.uid,
        email: firebaseUser.email ?? "",
      },
      isAuthenticated: true,
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
},
      logout: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (profileUpdates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profileUpdates } : null,
        }));
      },

      setOnboarded: (status) => {
        set({ isOnboarded: status });
      },
    }),
    {
      name: 'deadlinezero-auth',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
    }
  )
);
