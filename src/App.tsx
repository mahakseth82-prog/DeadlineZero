/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './client/store/auth.store';

// Import all page components
import { LandingView } from './client/features/landing/LandingView';
import { LoginView } from './client/features/auth/LoginView';
import { SignupView } from './client/features/auth/SignupView';
import { OnboardingView } from './client/features/onboarding/OnboardingView';
import { AppLayout } from './client/components/layout/AppLayout';
import { DashboardView } from './client/features/dashboard/DashboardView';
import { TaskManagementView } from './client/features/tasks/TaskManagementView';
import { CalendarView } from './client/features/calendar/CalendarView';
import { FocusRoomView } from './client/features/focus-room/FocusRoomView';
import { PanicModeView } from './client/features/panic-mode/PanicModeView';
import { AiCoachView } from './client/features/coach/AiCoachView';
import { AnalyticsView } from './client/features/analytics/AnalyticsView';
import { ProfileView } from './client/features/profile/ProfileView';
import { SettingsView } from './client/features/settings/SettingsView';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
