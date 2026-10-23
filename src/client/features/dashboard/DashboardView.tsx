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

  const handleTriggerEmergencyPanic = async (task: Task) => {
    // 1. If task already has incomplete subtasks, build the sprint around them!
    const incompleteSubtasks = task.subtasks?.filter(s => !s.completed) || [];
    let steps: { title: string; durationMinutes: number }[] = [];

    if (incompleteSubtasks.length > 0) {
      steps = incompleteSubtasks.map(s => ({
        title: s.title,
        durationMinutes: Math.max(15, Math.round((task.estimatedTime || 60) / incompleteSubtasks.length))
      }));
    } else {
      // 2. Fetch AI-generated emergency breakdown or use contextual fallback
      try {
        const res = await fetch('/api/ai/task-breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskTitle: task.title, taskDescription: task.description || '' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.subtasks && Array.isArray(data.subtasks) && data.subtasks.length > 0) {
            steps = data.subtasks.map((st: string) => ({
              title: st,
              durationMinutes: Math.max(15, Math.round((task.estimatedTime || 60) / data.subtasks.length))
            }));
          }
        }
      } catch (e) {
        console.warn('AI breakdown fallback in panic trigger:', e);
      }

      if (steps.length === 0) {
        steps = [
          { title: `Triage critical requirements for "${task.title}"`, durationMinutes: 20 },
          { title: `Execute core deliverable components`, durationMinutes: Math.max(30, Math.round((task.estimatedTime || 60) * 0.5)) },
          { title: `Conduct quality audit & compliance checks`, durationMinutes: 15 },
          { title: `Finalize deployment and submission`, durationMinutes: 15 }
        ];
      }
    }

    const durationHours = Math.max(1, Math.ceil(steps.reduce((acc, s) => acc + s.durationMinutes, 0) / 60));

    triggerPanic(task.id, task.title, durationHours, steps);
    addToast('Panic Mode Activated', `Tactical AI recovery roadmap generated for "${task.title}"!`, 'warning');
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

      {/* SECTION 1: Professional Executive Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Focus Strategy Active
              </span>
              {user && user.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{user.currentStreak} Day Streak</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">{getFirstName()}</span> 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal max-w-lg leading-relaxed">
                {criticalCount > 0 
                  ? `You have ${criticalCount} critical task${criticalCount !== 1 ? 's' : ''} requiring dedicated focus blocks today.` 
                  : `Your workspace is balanced with ${activeTasks.length} active objectives scheduled.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-md text-left">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                Estimated Focus
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">
                {formatEstimatedFocusTime(totalActiveMinutes)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                Active Objectives
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">
                {activeTasks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Identity Center */}
        <div className="lg:col-span-5 flex items-center justify-center min-h-[300px]">
          <ChronoCore />
        </div>
      </div>

      {/* SECTION 2: AI Priority Recommendation */}
      <div className="pt-2 text-left">
        {highestRisk ? (
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl group overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-sky-500" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start md:items-center">
              <div className="space-y-3.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    Priority Recommendation
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    {highestRisk.task.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
                    {highestRisk.triage.recommendation || 'This task is critical to keeping your current milestone delivery schedule on track. Initiate a deep focus sprint now.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-1 text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-semibold border ${
                    highestRisk.triage.riskLevel === RiskLevel.CRITICAL
                      ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
                      : highestRisk.triage.riskLevel === RiskLevel.HIGH
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40'
                  }`}>
                    {highestRisk.triage.riskLevel} Priority ({highestRisk.triage.riskScore}% Risk)
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatEffort(highestRisk.task.estimatedTime)}
                  </span>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Due {new Date(highestRisk.task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(highestRisk.task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
                <Button
                  onClick={() => handleLaunchFocus(highestRisk.task)}
                  className="w-full md:w-auto gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                >
                  <Flame className="w-4 h-4 fill-white/20" />
                  Start Focus Block
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-8 text-center">
            <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Objectives On Track</h3>
            <p className="text-xs text-slate-400 mt-1">No pending active deadline threats detected.</p>
          </div>
        )}
      </div>

      {/* SECTION 3: Needs Your Attention */}
      <div className="space-y-4 pt-2 text-left">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Needs Your Attention
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 gap-1 hover:bg-transparent"
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
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => navigate('/app/tasks')}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 shadow-xs hover:border-indigo-500/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px] cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 tracking-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h4>
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.priority === TaskPriority.CRITICAL
                          ? 'bg-rose-500/10 text-rose-500'
                          : task.priority === TaskPriority.HIGH
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatEffort(task.estimatedTime)}
                      </span>
                      <span>•</span>
                      <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                        {isOverdue 
                          ? 'Overdue' 
                          : `Due ${new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">
                      Risk Index: <strong className="text-slate-800 dark:text-slate-200">{triage.riskScore}%</strong>
                    </span>
                    <span className="text-xs font-semibold text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-3 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10">
              <span className="text-xs text-slate-400 font-medium">No pending overdue items</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Workspace Shortcuts */}
      <div className="space-y-4 pt-2 text-left">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Quick Workspaces
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          {/* Shortcut: Create Task */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/app/tasks')}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:border-indigo-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                Create Task
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                New objective
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Focus Room */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/app/focus-room')}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:border-amber-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-amber-500/10" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-amber-500 transition-colors">
                Focus Room
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Pomodoro sprint
              </span>
            </div>
          </motion.div>

          {/* Shortcut: AI Coach */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/app/coach')}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:border-sky-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-sky-500 transition-colors">
                AI Coach
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Strategy advice
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Calendar */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/app/calendar')}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:border-indigo-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-indigo-500 transition-colors">
                Calendar
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Timeline view
              </span>
            </div>
          </motion.div>

          {/* Shortcut: Panic Mode */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/app/panic-mode')}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:border-rose-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-rose-500 transition-colors">
                Panic Mode
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Emergency triage
              </span>
            </div>
          </motion.div>

        </div>
      </div>

    </motion.div>
  );
};
