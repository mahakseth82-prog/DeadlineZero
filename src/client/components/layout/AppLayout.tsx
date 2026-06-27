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
  ChevronRight
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
    { label: 'AI Productivity Coach', path: '/app/coach', icon: Bot },
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

  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-100 transition-colors duration-200 relative overflow-hidden"
    >
      {/* 3. PREMIUM ANIMATED BACKDROP */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Slow moving gradient mesh */}
        <div 
          style={{
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
            transition: 'transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)'
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Nebula clouds */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/[0.04] dark:bg-violet-600/[0.09] blur-[100px] animate-mesh-drift" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/[0.03] dark:bg-blue-600/[0.07] blur-[100px] animate-mesh-drift-reverse" />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-500/[0.02] dark:bg-indigo-500/[0.05] blur-[120px] animate-pulse-soft" />
        </div>

        {/* Soft interactive radial background glow */}
        <div 
          className="absolute inset-0 opacity-[0.2] dark:opacity-[0.4] pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x * 2 + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500)}px ${mousePos.y * 2 + (typeof window !== 'undefined' ? window.innerHeight / 2 : 300)}px, rgba(139, 92, 246, 0.05), transparent 80%)`,
            transition: 'background 0.1s ease'
          }}
        />

        {/* 5-10% Opacity Floating Orbs as requested by user */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.12, 0.92, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-violet-500/[0.05] dark:bg-violet-500/[0.08] blur-[70px] pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -50, 70, 0],
            y: [0, 80, -80, 0],
            scale: [1, 0.92, 1.08, 1],
          }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[20%] right-[15%] w-[380px] h-[380px] rounded-full bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] blur-[90px] pointer-events-none"
        />

        {/* Tiny subtle glowing stars in the global backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[15%] left-[25%] w-1 h-1 rounded-full bg-white animate-star-twinkle" />
          <div className="absolute top-[45%] left-[75%] w-1 h-1 rounded-full bg-white animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[75%] left-[15%] w-1 h-1 rounded-full bg-white animate-star-twinkle" style={{ animationDelay: '3s' }} />
          <div className="absolute top-[85%] left-[60%] w-1.5 h-1.5 rounded-full bg-violet-400 animate-star-twinkle" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-[30%] left-[85%] w-1 h-1 rounded-full bg-blue-400 animate-star-twinkle" style={{ animationDelay: '2.2s' }} />
        </div>

        {/* Delicate animated noise texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
      </div>
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-r border-zinc-100 dark:border-zinc-800 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800 justify-between">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-50 flex items-center justify-center font-bold text-white dark:text-zinc-900">
              DZ
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold tracking-tight text-zinc-900 dark:text-white text-lg">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium tracking-normal transition-all duration-200 group relative select-none ${
                  isActive
                    ? 'bg-zinc-100/70 dark:bg-zinc-800/40 text-violet-600 dark:text-violet-400 font-semibold'
                    : item.highlight
                    ? 'bg-red-500/10 text-red-500 dark:text-red-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                }`}
              >
                {/* Active vertical pill on the left edge */}
                {isActive && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-violet-500 dark:bg-violet-400 rounded-r-full" />
                )}
                
                <Icon className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${item.highlight ? 'animate-pulse text-red-500' : isActive ? 'text-violet-500 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                {!sidebarCollapsed && (
                  <span className="truncate tracking-normal font-sans text-sm">{item.label}</span>
                )}
                {item.highlight && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse absolute right-3" />
                )}
                
                {/* Tooltip for Collapsed Sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-16 hidden group-hover:flex items-center z-50">
                    <div className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-md font-bold shadow-lg whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-150 dark:border-zinc-850/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium tracking-normal text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-all duration-200 group relative select-none cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
            {!sidebarCollapsed && <span className="tracking-normal font-sans text-sm">Logout</span>}
            {sidebarCollapsed && (
              <div className="absolute left-16 hidden group-hover:flex items-center z-50">
                <div className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-md font-bold shadow-lg">
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
        <header className="h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-zinc-100/80 dark:border-zinc-800/80 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Panic Mode Active Banner */}
            {isPanicActive && (
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-full animate-pulse text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Panic Sprint Active: {formatPanicTime(panicSeconds)} remaining</span>
              </div>
            )}
          </div>

          {/* User info & Streaks */}
          <div className="flex items-center gap-6">
            
            {/* Streak Counter */}
            {user && user.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                <span>{user.currentStreak} Day Streak</span>
              </div>
            )}

            {/* Profile trigger */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[150px]">
                  {user?.email.split('@')[0]}
                </p>
                <p className="text-xs text-zinc-400">
                  Level {Math.floor((user?.productivityScore || 0) / 10) + 1}
                </p>
              </div>
              <Link to="/app/profile">
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover hover:opacity-85 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          const typeColors = {
            info: 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:text-zinc-900',
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400',
            warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400',
            error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400',
          };
          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border shadow-lg flex gap-3 items-start justify-between animate-slide-in ${typeColors[toast.type]}`}
            >
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{toast.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
