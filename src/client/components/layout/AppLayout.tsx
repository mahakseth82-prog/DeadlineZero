/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Flame, 
  Zap, 
  Bot, 
  BarChart2, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { usePanicStore } from '../../store/panic.store';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, themeMode, toasts, dismissToast } = useUiStore();
  const { isActive: isPanicActive, secondsRemaining: panicSeconds } = usePanicStore();

  React.useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/app/calendar', icon: CalendarIcon },
    { label: 'Focus Room', path: '/app/focus-room', icon: Flame },
    { label: 'Panic Mode', path: '/app/panic-mode', icon: Zap, highlight: isPanicActive },
    { label: 'AI Coach', path: '/app/coach', icon: Bot },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart2 },
    { label: 'Profile', path: '/app/profile', icon: User },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const formatPanicTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden font-sans">
      
      {/* Calm, Subtle Ambient SaaS Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] left-[25%] w-[550px] h-[550px] rounded-full bg-indigo-500/[0.04] dark:bg-indigo-500/[0.05] blur-[140px]" />
        <div className="absolute top-[45%] -right-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.03] dark:bg-sky-500/[0.04] blur-[130px]" />
      </div>
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80 justify-between">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-indigo-500/20">
              DZ
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                DeadlineZero
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium tracking-normal transition-all duration-150 group relative select-none ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-100 dark:border-indigo-500/20'
                    : item.highlight
                    ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-semibold border border-rose-500/20'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Active vertical pill indicator */}
                {isActive && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                )}
                
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                  item.highlight 
                    ? 'animate-pulse text-rose-500' 
                    : isActive 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`} />
                
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                
                {item.highlight && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse absolute right-3" />
                )}
                
                {/* Tooltip for Collapsed Sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-16 hidden group-hover:flex items-center z-50">
                    <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-lg font-medium shadow-lg whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium tracking-normal text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all duration-150 group relative select-none cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 text-slate-400 dark:text-slate-400 group-hover:text-rose-500" />
            {!sidebarCollapsed && <span>Logout</span>}
            {sidebarCollapsed && (
              <div className="absolute left-16 hidden group-hover:flex items-center z-50">
                <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-lg font-medium shadow-lg">
                  Logout
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Header / Navbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Panic Mode Active Banner */}
            {isPanicActive && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full animate-pulse text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Panic Sprint Active: {formatPanicTime(panicSeconds)} remaining</span>
              </div>
            )}
          </div>

          {/* User info & Streaks */}
          <div className="flex items-center gap-5">
            
            {/* Streak Counter */}
            {user && user.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-semibold text-xs bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{user.currentStreak} Day Streak</span>
              </div>
            )}

            {/* Profile capsule */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">
                  {user?.fullName?.trim() ? user.fullName : user?.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Level {Math.floor((user?.productivityScore || 0) / 10) + 1} Member
                </p>
              </div>
              <Link to="/app/profile">
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-indigo-500/30 object-cover hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          const typeColors = {
            success: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-white/95 dark:bg-slate-900/95',
            error: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-white/95 dark:bg-slate-900/95',
            warning: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-white/95 dark:bg-slate-900/95',
            info: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-white/95 dark:bg-slate-900/95',
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`p-4 rounded-2xl border shadow-lg backdrop-blur-xl flex items-start gap-3 relative overflow-hidden ${typeColors[toast.type]}`}
            >
              <div className="flex-1 space-y-0.5 text-left">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{toast.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{toast.message}</p>
              </div>
              <button 
                onClick={() => dismissToast(toast.id)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
