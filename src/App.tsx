/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './client/store/auth.store';
import { AppLayout } from './client/components/layout/AppLayout';
import AuthInitializer from "./client/components/AuthInitializer";

// High-Performance Route-Based Code Splitting via React.lazy()
const LandingView = lazy(() => import('./client/features/landing/LandingView').then(m => ({ default: m.LandingView })));
const LoginView = lazy(() => import('./client/features/auth/LoginView').then(m => ({ default: m.LoginView })));
const SignupView = lazy(() => import('./client/features/auth/SignupView').then(m => ({ default: m.SignupView })));
const OnboardingView = lazy(() => import('./client/features/onboarding/OnboardingView').then(m => ({ default: m.OnboardingView })));
const DashboardView = lazy(() => import('./client/features/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const TaskManagementView = lazy(() => import('./client/features/tasks/TaskManagementView').then(m => ({ default: m.TaskManagementView })));
const CalendarView = lazy(() => import('./client/features/calendar/CalendarView').then(m => ({ default: m.CalendarView })));
const FocusRoomView = lazy(() => import('./client/features/focus-room/FocusRoomView').then(m => ({ default: m.FocusRoomView })));
const PanicModeView = lazy(() => import('./client/features/panic-mode/PanicModeView').then(m => ({ default: m.PanicModeView })));
const AiCoachView = lazy(() => import('./client/features/coach/AiCoachView').then(m => ({ default: m.AiCoachView })));
const AnalyticsView = lazy(() => import('./client/features/analytics/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const ProfileView = lazy(() => import('./client/features/profile/ProfileView').then(m => ({ default: m.ProfileView })));
const SettingsView = lazy(() => import('./client/features/settings/SettingsView').then(m => ({ default: m.SettingsView })));

// Sleek futuristic route transition spinner
const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
    <div className="relative w-14 h-14 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/40 animate-spin" />
      <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center backdrop-blur-md">
        <span className="font-mono text-xs font-bold text-violet-400">DZ</span>
      </div>
    </div>
    <p className="mt-4 text-xs font-mono text-zinc-500 tracking-wider uppercase animate-pulse">Initializing Interface...</p>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<LandingView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />

          {/* Onboarding Wizard Route */}
          <Route 
            path="/app/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingView />
              </ProtectedRoute>
            } 
          />

          {/* Private Shell Layout Routes */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="tasks" element={<TaskManagementView />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="focus-room" element={<FocusRoomView />} />
            <Route path="panic-mode" element={<PanicModeView />} />
            <Route path="coach" element={<AiCoachView />} />
            <Route path="analytics" element={<AnalyticsView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
