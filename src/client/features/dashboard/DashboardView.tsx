/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Flame, 
  Zap, 
  Bot, 
  Calendar, 
  CheckSquare, 
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FloatingParticles } from '../../components/futuristic/FloatingParticles';
import { ChronoCore } from '../../components/futuristic/ChronoCore';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { useFocusStore } from '../../store/focus.store';
import { usePanicStore } from '../../store/panic.store';
import { useTaskStore, getTaskProgress } from '../../store/task.store';
import { Task, TaskPriority, TaskStatus, RiskLevel } from '../../../types';
import { formatEffort } from '../../utils/time';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { addToast } = useUiStore();
  const { linkTask, startTimer, setTimeRemaining } = useFocusStore();
  const { triggerPanic } = usePanicStore();
  const { tasks, updateTask, getTaskTriage } = useTaskStore();

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const nextStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
    updateTask(taskId, { status: nextStatus });
    
    addToast(
      nextStatus === TaskStatus.COMPLETED ? 'Task Completed' : 'Task Opened',
      `"${task.title}" is now marked as ${nextStatus.toLowerCase()}.`,
      'success'
    );
  };

  const handleLaunchFocus = (task: Task) => {
    linkTask(task.id, task.title);
    setTimeRemaining(25 * 60); // 25 mins
    startTimer();
    addToast('Focus Session Started', `Now focusing on "${task.title}"`, 'info');
    navigate('/app/focus-room');
  };

  const handleTriggerEmergencyPanic = (task: Task) => {
    triggerPanic(
      task.id,
      task.title,
      2, // 2 hours
      [
        { title: 'Write down structural index elements', durationMinutes: 20 },
        { title: 'Formulate core visual containers', durationMinutes: 30 },
        { title: 'Conduct final compilation audit checks', durationMinutes: 15 }
      ]
    );
    addToast('Panic Mode Activated', `Proactive recovery roadmap generated for "${task.title}"!`, 'warning');
    navigate('/app/panic-mode');
  };

  const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
  const activeTasksWithTriage = activeTasks.map(t => ({
    task: t,
    triage: getTaskTriage(t.id)
  })).sort((a, b) => b.triage.riskScore - a.triage.riskScore);

  const highestRisk = activeTasksWithTriage[0];
  const topAttentionTasks = activeTasksWithTriage.slice(0, 3);

  // Dynamic Greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  // Helper to extract first name from email cleanly
  const getFirstName = () => {
  if (user?.fullName?.trim()) {
    return user.fullName;
  }

  if (user?.email) {
    const localPart = user.email.split("@")[0];
    const cleaned = localPart.replace(/[0-9_.-]/g, "");

    if (!cleaned) return "Developer";

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }

  return "Developer";
};

  // Sum of estimated focus minutes for active tasks
  const totalActiveMinutes = activeTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0);
  const formatEstimatedFocusTime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  // Workload dynamic description
  const criticalCount = activeTasks.filter(t => t.priority === TaskPriority.CRITICAL || getTaskTriage(t.id).riskLevel === RiskLevel.CRITICAL).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-6xl mx-auto relative px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/[0.02] dark:bg-violet-500/[0.03] blur-[120px] pointer-events-none -z-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-5 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.015] dark:bg-indigo-500/[0.025] blur-[100px] pointer-events-none -z-20" />
      
      <FloatingParticles />

      {/* SECTION 1: Premium Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-900/30 shadow-sm">
                CHRONO CORE ACTIVE
              </span>
              {user && user.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/15 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase">
                  <Flame className="w-3 h-3 fill-amber-500/10" />
                  <span>{user.currentStreak} Day Streak</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">{getFirstName()}</span> 👋
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
                Chrono Core analyzed your workspace. <br />
                <span className="text-violet-600 dark:text-violet-400 font-semibold">{criticalCount > 0 ? `${criticalCount} critical task${criticalCount !== 1 ? 's' : ''}` : `${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''}`}</span> require attention today.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-5 border-t border-zinc-150 dark:border-zinc-850/60 max-w-sm">
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                Estimated Focus Time
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-800 dark:text-zinc-100 mt-0.5 block">
                {formatEstimatedFocusTime(totalActiveMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block">
                Active Objectives
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-800 dark:text-zinc-100 mt-0.5 block">
                {activeTasks.length}
              </span>
            </div>
          </div>
        </div>

        {/* ChronoCore Animated Visual Identity */}
        <div className="lg:col-span-5 flex items-center justify-center min-h-[340px] md:min-h-[380px]">
          <ChronoCore />
        </div>
      </div>

      {/* SECTION 2: Beautiful AI Recommendation */}
      <div className="pt-2">
        {highestRisk ? (
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative rounded-2xl border border-violet-500/20 dark:border-violet-400/20 bg-white/70 dark:bg-zinc-900/40 p-8 md:p-10 shadow-xl shadow-violet-500/[0.02] dark:shadow-violet-400/[0.01] backdrop-blur-md group overflow-hidden"
          >
            {/* Subtle glow edge gradient */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 to-indigo-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/[0.02] dark:bg-violet-500/[0.04] rounded-full blur-3xl group-hover:bg-violet-500/[0.06] transition-colors duration-500 pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 md:gap-10 justify-between items-start md:items-center">
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400 animate-pulse" />
                  <span className="text-[10px] font-bold font-mono tracking-widest text-violet-600 dark:text-violet-400 uppercase">
                    Chrono Recommendation
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white truncate leading-none">
                    {highestRisk.task.title}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl font-medium">
                    {highestRisk.triage.recommendation || 'This task is critical to keeping your current milestone delivery schedule on track. Initiate a deep focus sprint now.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-1.5 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] tracking-wider uppercase border ${
                    highestRisk.triage.riskLevel === RiskLevel.CRITICAL
                      ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                      : highestRisk.triage.riskLevel === RiskLevel.HIGH
                      ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                      : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                  }`}>
                    {highestRisk.triage.riskLevel} Risk ({highestRisk.triage.riskScore}%)
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {formatEffort(highestRisk.task.estimatedTime)}
                  </span>

                  <span className="text-zinc-400 dark:text-zinc-500">•</span>

                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Due {new Date(highestRisk.task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(highestRisk.task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleLaunchFocus(highestRisk.task)}
                    className="w-full md:w-auto gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider font-mono rounded-xl border-none shadow-lg shadow-violet-500/10 dark:shadow-violet-400/[0.02]"
                  >
                    <Flame className="w-4 h-4 fill-white/10" />
                    Start Focus Session
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10 p-8 text-center">
            <Sparkles className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All Systems Nominal</h3>
            <p className="text-xs text-zinc-400 mt-1">No pending active threats detected by the AI triage engine.</p>
          </div>
        )}
      </div>

      {/* SECTION 3: Needs Your Attention */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500" />
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">
              Needs Your Attention
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/tasks')}
            className="text-xs font-bold text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 font-mono gap-1 hover:bg-transparent"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topAttentionTasks.length > 0 ? (
            topAttentionTasks.map(({ task, triage }) => {
              const isOverdue = triage.isOverdue;
              return (
                <motion.div
                  key={task.id}
                  whileHover={{ 
                    y: -5,
                    scale: 1.015,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => navigate('/app/tasks')}
                  className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5.5 shadow-sm hover:shadow-[0_12px_24px_-8px_rgba(124,58,237,0.12)] hover:border-violet-500/25 dark:hover:border-violet-400/20 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between min-h-[140px] cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 tracking-tight group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                        {task.title}
                      </h4>
                      <span className={`flex-shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        task.priority === TaskPriority.CRITICAL
                          ? 'bg-red-500/10 text-red-500'
                          : task.priority === TaskPriority.HIGH
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatEffort(task.estimatedTime)}
                      </span>
                      <span>•</span>
                      <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                        {isOverdue 
                          ? 'Overdue' 
                          : `Due ${new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100/50 dark:border-zinc-850/50 flex justify-between items-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono">
                      Risk Index: {triage.riskScore}%
                    </span>
                    <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                      Inspect →
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-3 py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50/20 dark:bg-zinc-900/10">
              <span className="text-xs text-zinc-400 font-mono font-semibold">// NO ACTIVE DELIVERABLES</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Workspace Shortcuts */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">
          Workspace Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          {/* Shortcut: Create Task */}
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => navigate('/app/tasks')}
            className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-[0_12px_24px_rgba(124,58,237,0.06)] hover:border-violet-500/20 dark:hover:border-violet-400/20 backdrop-blur-sm cursor-pointer transition-all duration-300 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-400/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                Create Task
              </span>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono tracking-wider uppercase">
                Add objective
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Focus Room */}
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => navigate('/app/focus-room')}
            className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-[0_12px_24px_rgba(245,158,11,0.06)] hover:border-amber-500/20 dark:hover:border-amber-400/20 backdrop-blur-sm cursor-pointer transition-all duration-300 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm">
              <Flame className="w-5 h-5 fill-amber-500/10" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-amber-500 transition-colors">
                Focus Room
              </span>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono tracking-wider uppercase">
                Sprint timer
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Chrono Coach */}
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => navigate('/app/coach')}
            className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-[0_12px_24px_rgba(59,130,246,0.06)] hover:border-blue-500/20 dark:hover:border-blue-400/20 backdrop-blur-sm cursor-pointer transition-all duration-300 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-blue-500 transition-colors">
                Chrono Coach
              </span>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono tracking-wider uppercase">
                Get guidance
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Calendar */}
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => navigate('/app/calendar')}
            className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-[0_12px_24px_rgba(99,102,241,0.06)] hover:border-indigo-500/20 dark:hover:border-indigo-400/20 backdrop-blur-sm cursor-pointer transition-all duration-300 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-indigo-500 transition-colors">
                Calendar
              </span>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono tracking-wider uppercase">
                Assign slots
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Panic Mode */}
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => navigate('/app/panic-mode')}
            className="rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-[0_12px_24px_rgba(239,68,68,0.06)] hover:border-red-500/20 dark:hover:border-red-400/20 backdrop-blur-sm cursor-pointer transition-all duration-300 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-red-500 transition-colors">
                Panic Mode
              </span>
              <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono tracking-wider uppercase">
                Task rescue
              </span>
            </div>
          </motion.div>

        </div>
      </div>

    </motion.div>
  );
};
