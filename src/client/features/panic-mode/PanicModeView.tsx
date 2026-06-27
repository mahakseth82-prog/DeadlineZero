/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Award,
  ShieldAlert,
  Bot,
  Check,
  CheckCircle,
  Clock,
  Timer,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { usePanicStore } from '../../store/panic.store';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { useTaskStore } from '../../store/task.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatEffort } from '../../utils/time';
import { TaskStatus } from '../../../types';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyCountdownCore } from '../../components/futuristic/EmergencyCountdownCore';

// Premium animated AI avatar specifically designed for Panic Mode
const AssistantAvatar: React.FC<{ isThinking: boolean }> = ({ isThinking }) => {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center" id="assistant-avatar-container">
      {/* Pulse rings */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.15, 1] : [1, 1.08, 1],
          opacity: isThinking ? [0.15, 0.35, 0.15] : [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: isThinking ? 1.4 : 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E85D75]/40 via-[#D9485F]/20 to-zinc-900 blur-sm pointer-events-none"
      />
      
      {/* Outer spinning dash ring */}
      <motion.div
        animate={{ rotate: isThinking ? 360 : -180 }}
        transition={{
          duration: isThinking ? 5 : 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-1 border border-dashed border-[#E85D75]/20 rounded-full pointer-events-none"
      />

      {/* Glass Core */}
      <div className="absolute w-9 h-9 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-[#E85D75]/15 flex items-center justify-center shadow-lg overflow-hidden">
        <motion.div
          animate={{
            y: isThinking ? [-1, 1, -1] : [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bot className="w-4 h-4 text-[#E85D75] drop-shadow-[0_0_4px_rgba(232,93,117,0.3)]" />
        </motion.div>
      </div>
    </div>
  );
};

// Animated percentage component using easeOutExpo for high-end feel
const AnimatedPercentage: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1200 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo formula
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue}%</>;
};

// Breathing Apple-like status indicator
const BreathingDot: React.FC<{ className?: string }> = ({ className = "w-1.5 h-1.5 bg-[#E85D75]" }) => (
  <motion.span
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.6, 1, 0.6]
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`rounded-full inline-block ${className}`}
  />
);

// AI Coach Recommendations
const RECOMMENDATIONS = [
  "Finish production database schema structures first.",
  "Ignore lower-priority aesthetic documentation files.",
  "Focus on high-impact backend modules to prevent overload.",
  "Establish direct focus sprints after local audits complete.",
  "Bypass low-critical presentation preparations temporarily.",
  "Optimize client local-state caches to minimize latency."
];

export const PanicModeView: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const { user, updateProfile } = useAuthStore();
  const { getCrisisTasks, updateTask } = useTaskStore();
  const { 
    isActive, 
    taskId, 
    taskTitle, 
    secondsRemaining, 
    recoveryPlan,
    triggerPanic,
    tickPanicTimer,
    toggleStep,
    resolvePanic,
    cancelPanic,
    completedPanics
  } = usePanicStore();

  const crisisTasks = getCrisisTasks();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // States for polish & loading animations
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStage, setGeneratingStage] = useState('');
  const [loadingNext, setLoadingNext] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [recIndex, setRecIndex] = useState(0);

  // Interval for rotating AI Coach Recommendations
  useEffect(() => {
    const recTimer = setInterval(() => {
      setRecIndex((prev) => (prev + 1) % RECOMMENDATIONS.length);
    }, 5500);
    return () => clearInterval(recTimer);
  }, []);

  // Interval hook to tick the panic clock
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        tickPanicTimer();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, tickPanicTimer]);

  // Dynamic Metrics & Stats
  const totalCompletedPanics = completedPanics.length;
  const minutesRecovered = useMemo(() => {
    return completedPanics.length * 90; // Approx 90 mins per recovery sprint
  }, [completedPanics]);

  const recoverySuccessPrediction = useMemo(() => {
    const base = 94 - (crisisTasks.length * 2);
    return Math.max(78, Math.min(96, base));
  }, [crisisTasks]);

  // Calculate estimated recovery time
  const totalRecoveryTimeText = useMemo(() => {
    const totalMinutes = crisisTasks.length * 45;
    if (totalMinutes === 0) return '0m';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}h` : `${mins}m`;
  }, [crisisTasks]);

  // Unified helper to simulate high-tech tactical plan generation
  const runLaunchSimulation = (targetId: string, title: string, durationHours: number, steps: {title: string, durationMinutes: number}[]) => {
    setIsGeneratingPlan(true);
    setGeneratingProgress(0);
    
    const stages = [
      '⚡ Chrono Recovery Engine',
      'Analyzing dependencies...',
      'Optimizing recovery order...',
      'Calculating completion probability...'
    ];

    setGeneratingStage(stages[0]);

    // Fast-step simulate state progress
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update labels based on progress percentages
        if (next > 75) {
          setGeneratingStage(stages[3]);
        } else if (next > 45) {
          setGeneratingStage(stages[2]);
        } else if (next > 20) {
          setGeneratingStage(stages[1]);
        }
        return next;
      });
    }, 100);

    setTimeout(() => {
      setIsGeneratingPlan(false);
      triggerPanic(targetId, title, durationHours, steps);
      addToast('Panic Activated', 'Dynamic emergency recovery roadmap ready!', 'warning');
    }, 1200);
  };

  const handleResolve = (targetTaskId?: string | null, targetTaskTitle?: string | null) => {
    const resolvedId = targetTaskId || taskId;
    const resolvedTitle = targetTaskTitle || taskTitle || "Emergency Sprint Task";
    
    // Play success overlay first
    setSuccessAnimation(true);

    setTimeout(() => {
      if (resolvedId) {
        updateTask(resolvedId, { status: TaskStatus.COMPLETED });
      }

      const prevProductivity = user?.productivityScore || 78;
      updateProfile({ 
        productivityScore: Math.min(100, prevProductivity + 6),
        focusScore: Math.min(100, (user?.focusScore || 84) + 4)
      });

      resolvePanic();
      setSuccessAnimation(false);
      
      addToast(
        'Recovery Complete!',
        `Congratulations! "${resolvedTitle}" has been fully recovered, completed, and removed from Panic Mode.`,
        'success'
      );

      // Automated transition: Check if another critical task exists in the queue
      const remainingCrisis = crisisTasks.filter(t => t.id !== resolvedId);
      if (remainingCrisis.length > 0) {
        const nextTask = remainingCrisis[0];
        setLoadingNext(true);
        addToast('Transitioning...', `Loading next critical task: "${nextTask.title}"`, 'info');
        
        setTimeout(() => {
          const steps = nextTask.subtasks.length > 0 
            ? nextTask.subtasks.map(s => ({ title: s.title, durationMinutes: Math.ceil(nextTask.estimatedTime / nextTask.subtasks.length) }))
            : [
                { title: `Analyze objectives and design draft schemas for: ${nextTask.title}`, durationMinutes: 20 },
                { title: 'Implement and compile core modules', durationMinutes: 30 },
                { title: 'Audit error conditions and run integration checks', durationMinutes: 15 },
                { title: 'Perform final push and delivery', durationMinutes: 15 }
              ];
          
          triggerPanic(nextTask.id, nextTask.title, 1.5, steps);
          setLoadingNext(false);
          addToast('Emergency Sprint Restructured', `Dynamic recovery roadmap generated for "${nextTask.title}"!`, 'warning');
        }, 2200);
      }
    }, 2500);
  };

  const handleToggleStep = (stepId: string) => {
    toggleStep(stepId);
    
    const step = recoveryPlan.find(s => s.id === stepId);
    if (!step) return;

    const willBeCompleted = !step.completed;
    const futureCompletedCount = recoveryPlan.reduce((acc, s) => {
      if (s.id === stepId) return acc + (willBeCompleted ? 1 : 0);
      return acc + (s.completed ? 1 : 0);
    }, 0);

    if (futureCompletedCount === recoveryPlan.length && recoveryPlan.length > 0) {
      setTimeout(() => {
        handleResolve(taskId, taskTitle);
      }, 500);
    }
  };

  const handleCancel = () => {
    cancelPanic();
    addToast('Panic Dismissed', 'Recovery session cancelled. Keep eye on deadlines.', 'info');
  };

  // Mock reschedule event adding hours to the deadline
  const handleReschedule = () => {
    addToast('Postponement Request Transmitted', 'Chrono is negotiating timeline adjustments.', 'info');
    setTimeout(() => {
      addToast('Reschedule Confirmed', 'Deadline pushed by 4 hours.', 'success');
      handleCancel();
    }, 1500);
  };

  const completedSteps = recoveryPlan.filter(s => s.completed).length;
  const totalSteps = recoveryPlan.length;

  // Spacing & Layout helpers for 1-click launch or specific tasks
  const topCrisisTasks = useMemo(() => {
    return crisisTasks.slice(0, 3);
  }, [crisisTasks]);

  // Total Task-Level recovery metrics for header
  const recoveredCount = completedPanics.length;
  const totalCount = crisisTasks.length + completedPanics.length;
  const overallProgressPercent = totalCount > 0 ? Math.round((recoveredCount / totalCount) * 100) : 68;

  // Circular progress dimensions
  const radius = 22;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (recoverySuccessPrediction / 100) * circumference;

  // Drifting ambient low-opacity visual particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
    }));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-[88px] max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-140px)] relative overflow-visible select-none pb-12"
      id="panic-mode-room-workspace"
    >
      {/* Ambient Drifting Red Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-radial-gradient from-[#E85D75]/2 via-transparent to-transparent pointer-events-none" />
        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.01, 0.04, 0.01],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="rounded-full bg-[#E85D75]/5 blur-[1px] pointer-events-none"
          />
        ))}
      </div>

      {/* PLAN GENERATION SIMULATION OVERLAY */}
      <AnimatePresence>
        {isGeneratingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-[#E85D75]/15 shadow-[0_0_40px_rgba(232,93,117,0.06)] flex flex-col items-center gap-5 text-center max-w-md w-full mx-4 backdrop-blur-xl"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#E85D75]/30"
                />
                <Bot className="w-8 h-8 text-[#E85D75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                  {generatingStage}
                </h3>
              </div>

              {/* High-fidelity simulation progress bar */}
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-white/[0.04] p-[1px]">
                <div 
                  style={{ width: `${generatingProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#E85D75] to-[#D9485F] rounded-full transition-all duration-150"
                />
              </div>

              <span className="text-[10px] font-mono text-[#E85D75]">
                OPTIMIZING RECOVERY ROADMAP ({generatingProgress}%)
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMERGENCY SUCCESS ANIMATION OVERLAY */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col items-center gap-4 text-center max-w-sm"
            >
              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Check className="w-8 h-8 stroke-[2.5]" />
              </motion.div>
              <div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-widest block uppercase mb-1">
                  SPRINT COMPLETED
                </span>
                <h3 className="text-base font-black text-white">Recovery Successful</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Excellent focus! Task removed from Panic Mode.
                </p>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <div className="border-b border-white/[0.04] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 flex-shrink-0 text-left">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.08, 0.2, 0.08]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#E85D75]/15 rounded-full blur-md"
              />
              <ShieldAlert className="w-7 h-7 text-[#E85D75] relative z-10 filter drop-shadow-[0_0_6px_rgba(232,93,117,0.25)]" />
            </div>
            
            <h1 className="text-3xl sm:text-[34px] font-black text-white tracking-tight leading-tight">
              🚨 Panic Mode Activated
            </h1>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Chrono has detected critical tasks requiring immediate attention.
          </p>
        </div>

        {/* Hero status chips - Reduced visual weight & Added subtle pulse dot */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-[#E85D75]/5 border border-[#E85D75]/12 px-3 py-1 rounded-full text-[10px] font-mono font-semibold text-[#E85D75]/90 select-none">
            <BreathingDot className="w-1.5 h-1.5 bg-[#E85D75]" />
            Recovery Engine Active
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white/[0.01] border border-white/[0.05] px-3 py-1 rounded-full text-[10px] font-mono text-zinc-400 font-medium">
            <BreathingDot className="w-1.5 h-1.5 bg-rose-400/75" />
            System Status
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white/[0.01] border border-white/[0.05] px-3 py-1 rounded-full text-[10px] font-mono text-zinc-400 font-medium">
            <span>Crisis Targets:</span>
            <span className="font-bold text-white bg-white/[0.03] px-1.5 py-0.2 rounded-md">
              {crisisTasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* RENDER CHANNELS */}
      {crisisTasks.length === 0 ? (
        
        /* 9. EMPTY STATE: WORKSPACE STABILIZED */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto py-16 text-center"
          id="panic-stabilized-state"
        >
          <Card className="p-10 border border-emerald-500/10 bg-white/[0.01] backdrop-blur-md shadow-2xl space-y-8 relative overflow-hidden flex flex-col items-center rounded-3xl">
            {/* Soft Green Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-emerald-500/10 pointer-events-none" />
            <div className="absolute -top-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            
            <motion.div 
              animate={{
                y: [-2, 2, -2],
                boxShadow: ["0 0 10px rgba(16,185,129,0.1)", "0 0 20px rgba(16,185,129,0.25)", "0 0 10px rgba(16,185,129,0.1)"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md"
            >
              <CheckCircle className="w-8 h-8 stroke-[2]" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">🎉 Workspace Stabilized</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Chrono has successfully recovered your schedule.
              </p>
            </div>

            {/* Empty State Metrics */}
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] text-center">
                <span className="text-[9px] text-zinc-500 block font-mono tracking-wider">TASKS SAVED</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{totalCompletedPanics} saved</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] text-center">
                <span className="text-[9px] text-zinc-500 block font-mono tracking-wider">RECOVERY TIME</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{minutesRecovered}m</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] text-center">
                <span className="text-[9px] text-zinc-500 block font-mono tracking-wider">CURRENT RISK</span>
                <span className="text-sm font-extrabold text-emerald-500 mt-1 block">0%</span>
              </div>
            </div>

            <div className="w-full pt-4">
              <Button
                onClick={() => navigate('/app/focus-room')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>

      ) : (
        
        /* LAYOUT WITH ACTIVE SPRINT AND STANDBY MODES */
        <div className="space-y-[88px]">
          
          {/* 3. RECOVERY PROGRESS (FULL WIDTH) */}
          <Card className="p-8 sm:p-9 border border-white/[0.05] bg-zinc-900/10 backdrop-blur-md relative overflow-hidden rounded-2xl text-left">
            <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-[#E85D75]/2 to-transparent pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
              <div className="space-y-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase">RECOVERY PROGRESS</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-white font-mono tracking-tight">
                    <AnimatedPercentage value={overallProgressPercent} />
                  </span>
                  <span className="text-xs text-zinc-400 font-medium font-mono">
                    Recovering {recoveredCount} of {totalCount || 1} Critical Tasks
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right space-y-1">
                <span className="text-[10px] text-zinc-500 font-mono block tracking-wider uppercase">ESTIMATED RECOVERY</span>
                <span className="text-xl font-black text-[#E85D75] font-mono tracking-tight block">
                  {totalRecoveryTimeText}
                </span>
              </div>
            </div>

            {/* Premium Full-width gradient progress bar */}
            <div className="w-full bg-zinc-950/60 h-3.5 rounded-full overflow-hidden border border-white/[0.04] p-[1px] relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="bg-gradient-to-r from-[#E85D75] to-[#D9485F] h-full rounded-full relative overflow-hidden"
              >
                {/* Slow moving subtle shimmer travelling left to right every 3 seconds */}
                <motion.div
                  animate={{ x: ["-100%", "250%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent w-1/2 pointer-events-none"
                />
              </motion.div>
            </div>

            <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-zinc-500">
              <span>Overall status: {overallProgressPercent}% complete</span>
              <span className="text-[#E85D75] flex items-center gap-1.5">
                <BreathingDot className="w-1.5 h-1.5 bg-[#E85D75]" />
                Active recovery ongoing
              </span>
            </div>
          </Card>

          {!isActive ? (
            
            /* STANDBY SCREEN - MULTI-COLUMN DESIGN */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               
              {/* LEFT: TOP 3 CRITICAL TASKS */}
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                  <h2 className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase">
                    CRITICAL TARGETS
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-500">Sorted by deadline urgency</span>
                </div>

                <div className="space-y-4">
                  {topCrisisTasks.map(task => {
                    const taskRisk = 91; // Computed/Default high risk indicator
                    const subtaskCount = task.subtasks?.length || 0;
                    const subtaskDone = task.subtasks?.filter(s => s.completed)?.length || 0;

                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ 
                          y: -4,
                          boxShadow: "0 20px 40px -16px rgba(0,0,0,0.95), 0 0 15px rgba(232, 93, 117, 0.06), inset 0 1px 1px rgba(255,255,255,0.05)"
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="rounded-2xl border border-white/[0.05] bg-zinc-950/40 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),_0_12px_24px_-10px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer transition-all duration-250 ease-out hover:border-[#E85D75]/20"
                      >
                        <div className="py-[26px] sm:py-7 px-6 sm:px-7 flex flex-col justify-between gap-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-bl from-[#E85D75]/1 to-transparent pointer-events-none" />
                          
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-base font-black text-white tracking-tight truncate max-w-[400px]">
                                {task.title}
                              </h4>
                              
                              {/* Redesigned Risk Badge */}
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black px-2.5 py-1 rounded-full bg-[#E85D75]/10 text-[#E85D75] border border-[#E85D75]/20 shadow-[0_0_8px_rgba(232,93,117,0.06)] backdrop-blur-sm select-none">
                                <span className="w-1 h-1 rounded-full bg-[#E85D75]" />
                                <span>HIGH RISK</span>
                                <span className="text-white/20 font-light">|</span>
                                <span>{taskRisk}%</span>
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                              {task.description || 'No descriptive parameters. Chrono will formulate operational tasks dynamically.'}
                            </p>
                          </div>

                          {/* Simplified Metadata and Redesigned Start Button - Reduced Width & Right-Aligned on Same Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/[0.03] mt-auto">
                            <div className="flex flex-wrap gap-4 items-center text-[10px] text-zinc-500 font-mono font-light">
                              <span className="flex items-center gap-1.5 text-zinc-500">
                                <Timer className="w-3.5 h-3.5 text-zinc-600" /> 
                                Est: <span className="text-zinc-400 font-medium">{formatEffort(task.estimatedTime)}</span>
                              </span>
                              <span className="text-zinc-700">•</span>
                              <span className="flex items-center gap-1.5 text-zinc-500">
                                <Clock className="w-3.5 h-3.5 text-zinc-600" /> 
                                Due: <span className="text-[#E85D75]/85 font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                              </span>
                              {subtaskCount > 0 && (
                                <>
                                  <span className="text-zinc-700">•</span>
                                  <span className="flex items-center gap-1.5 text-zinc-500">
                                    Subtasks: <span className="text-cyan-500/80 font-semibold">{subtaskDone}/{subtaskCount}</span>
                                  </span>
                                </>
                              )}
                            </div>

                            <motion.button
                              initial="initial"
                              whileHover="hover"
                              whileTap="active"
                              variants={{
                                initial: {
                                  y: 0,
                                  scale: 1,
                                  background: "linear-gradient(to bottom, #E85D75, #D9485F)",
                                  boxShadow: "0 0 0px rgba(232, 93, 117, 0)",
                                },
                                hover: {
                                  y: -2,
                                  scale: 1.02,
                                  background: "linear-gradient(to bottom, #D9485F, #C43D53)",
                                  boxShadow: "0 4px 14px rgba(232, 93, 117, 0.35)",
                                },
                                active: {
                                  scale: 0.98,
                                  background: "linear-gradient(to bottom, #C43D53, #C43D53)",
                                }
                              }}
                              transition={{
                                type: "tween",
                                ease: "easeOut",
                                duration: 0.25,
                              }}
                              onClick={() => {
                                const steps = task.subtasks?.length > 0 
                                  ? task.subtasks.map(s => ({ title: s.title, durationMinutes: Math.ceil(task.estimatedTime / task.subtasks.length) }))
                                  : [
                                      { title: `Analyze objectives and design draft schemas for: ${task.title}`, durationMinutes: 20 },
                                      { title: 'Implement and compile core modules', durationMinutes: 30 },
                                      { title: 'Audit error conditions and run linter checks', durationMinutes: 15 },
                                      { title: 'Perform final push and delivery', durationMinutes: 15 }
                                    ];
                                runLaunchSimulation(task.id, task.title, 1.5, steps);
                              }}
                              className="h-[38px] w-[160px] text-white rounded-[12px] cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold select-none border border-[#E85D75]/25"
                            >
                              <Zap className="w-3.5 h-3.5 fill-white text-white/95 mr-1" />
                              <span>Start Recovery</span>
                              <motion.span
                                variants={{
                                  hover: { x: 5 }
                                }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="ml-0.5"
                              >
                                →
                              </motion.span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: CONFIDENCE & ASSISTANT */}
              <div className="lg:col-span-4 space-y-12">
                
                {/* 4. RECOVERY CONFIDENCE */}
                <div className="space-y-4 text-left">
                  <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                    RECOVERY CONFIDENCE
                  </span>
                  
                  <div className="flex items-center gap-5 bg-zinc-900/10 border border-white/[0.04] p-6 rounded-2xl relative overflow-hidden">
                    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90">
                        {/* Background */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className="stroke-zinc-800"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                        />
                        {/* Circle value */}
                        <motion.circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className="stroke-[#E85D75]"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute text-xs font-mono font-bold text-white">
                        <AnimatedPercentage value={recoverySuccessPrediction} duration={1500} />
                      </span>
                    </div>

                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold text-white">Chrono Confidence Quotient</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal font-light">
                        Chrono predicts all critical tasks can be completed before their deadlines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. CHRONO RECOVERY ASSISTANT */}
                <div className="space-y-4 text-left">
                  <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                    CHRONO ASSISTANT
                  </span>
                  
                  <Card className="p-6 bg-zinc-900/10 border border-white/[0.05] backdrop-blur-md shadow-xl flex flex-col gap-4 relative overflow-hidden rounded-2xl">
                    <div className="flex items-center gap-3">
                      <AssistantAvatar isThinking={false} />
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white tracking-wide font-mono">CHRONO AI</h4>
                        <span className="text-[8px] font-mono tracking-wider text-[#E85D75] block uppercase">
                          STANDBY COMPILING
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#E85D75]/5 border border-[#E85D75]/10 p-4 rounded-xl space-y-2 text-[11px] text-zinc-300 leading-relaxed min-h-[110px] flex flex-col justify-between relative overflow-hidden">
                      <span className="text-[9px] font-mono font-bold text-[#E85D75] tracking-wider block uppercase">
                        CURRENT RECOMMENDATION
                      </span>

                      <AnimatePresence mode="wait">
                        <motion.p
                          key={recIndex}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="text-[11px] text-zinc-300 font-medium leading-relaxed"
                        >
                          "{RECOMMENDATIONS[recIndex]}"
                        </motion.p>
                      </AnimatePresence>

                      <div className="flex justify-end gap-1 pt-1">
                        {RECOMMENDATIONS.map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              i === recIndex ? 'bg-[#E85D75]' : 'bg-zinc-800'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

              </div>

            </div>

          ) : (
            
            /* ACTIVE EMERGENCIES - REFINED WORKSPACE layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Tasks Queue */}
              <div className="lg:col-span-3 flex flex-col gap-5 text-left">
                <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                  CRITICAL QUEUE
                </span>

                {/* Active Card */}
                <div className="p-5 rounded-xl bg-[#E85D75]/4 border border-[#E85D75]/12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-[#E85D75]" />
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-bold text-[#E85D75]/90 uppercase tracking-widest flex items-center gap-2">
                      <BreathingDot className="w-1.5 h-1.5 bg-[#E85D75]" /> IN PROGRESS
                    </span>
                    <h4 className="text-xs font-bold text-white truncate mt-1">{taskTitle}</h4>
                    <p className="text-[10px] text-zinc-400 font-light">Current active recovery target.</p>
                  </div>
                </div>

                {/* Queue list */}
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-black text-zinc-400 tracking-wider block uppercase">
                    QUEUED TO RECOVER
                  </span>

                  {crisisTasks.filter(t => t.id !== taskId).length > 0 ? (
                    crisisTasks.filter(t => t.id !== taskId).slice(0, 2).map(task => (
                      <div 
                        key={task.id}
                        className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-2.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-xs font-bold text-white truncate max-w-[140px]">{task.title}</h5>
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E85D75]/5 text-[#E85D75]/90">
                            PENDING
                          </span>
                        </div>
                        <Button 
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const steps = task.subtasks?.length > 0 
                              ? task.subtasks.map(s => ({ title: s.title, durationMinutes: Math.ceil(task.estimatedTime / task.subtasks.length) }))
                              : [
                                  { title: `Analyze objectives and design draft schemas for: ${task.title}`, durationMinutes: 20 },
                                  { title: 'Implement and compile core modules', durationMinutes: 30 },
                                  { title: 'Audit error conditions and run integration checks', durationMinutes: 15 },
                                  { title: 'Perform final push and delivery', durationMinutes: 15 }
                                ];
                            triggerPanic(task.id, task.title, 1.5, steps);
                            addToast('Panic Shifted', `Shifted focus sprint to "${task.title}"`, 'warning');
                          }}
                          className="w-full text-[9px] font-bold border-zinc-800 text-zinc-400 hover:bg-zinc-800/40 py-1.5 cursor-pointer rounded-lg"
                        >
                          Swap Focus Target
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-white/[0.04] bg-white/[0.01] text-center text-[10px] text-zinc-500 italic">
                      No other critical tasks queued.
                    </div>
                  )}
                </div>
              </div>

              {/* Center Panel: Active Workspace */}
              <div className="lg:col-span-6 flex flex-col bg-zinc-900/10 border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#E85D75]/3 blur-[80px] pointer-events-none" />

                <div className="bg-white/[0.01] border-b border-white/[0.05] py-4 px-6 flex items-center justify-between z-10 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <BreathingDot className="w-1.5 h-1.5 bg-[#E85D75]" />
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-white tracking-wide font-mono">WORKSPACE SPRINT</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="xs" 
                      onClick={handleCancel} 
                      className="text-[10px] font-bold border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleResolve()}
                      disabled={completedSteps < totalSteps}
                      className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer px-3 flex items-center gap-1 disabled:opacity-40"
                    >
                      <Award className="w-3.5 h-3.5" /> Resolve
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-7 space-y-6">
                  {/* Timer centerpiece */}
                  <div className="flex flex-col items-center justify-center py-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl relative overflow-hidden">
                    {loadingNext ? (
                      <div className="h-[200px] flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 text-[#E85D75] animate-spin" />
                        <span className="text-xs font-mono text-zinc-500">GENERATING ROADMAP TELEMETRY...</span>
                      </div>
                    ) : (
                      <EmergencyCountdownCore 
                        size={180} 
                        secondsRemaining={secondsRemaining} 
                        totalDuration={recoveryPlan.reduce((acc, s) => acc + (s.durationMinutes || 15), 0) * 60} 
                      />
                    )}
                  </div>

                  {/* Task Card details */}
                  <div className="p-6 rounded-xl bg-zinc-950/40 border border-white/[0.06] backdrop-blur-xl text-left relative shadow-lg">
                    <h3 className="text-sm font-extrabold text-white mt-1">{taskTitle}</h3>
                    
                    <div className="grid grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-white/[0.04] text-[11px]">
                      <div>
                        <span className="text-[9px] text-zinc-500 block font-mono uppercase">EST_DURATION</span>
                        <span className="text-xs font-bold text-white mt-0.5 block">{formatEffort(recoveryPlan.reduce((acc, s) => acc + (s.durationMinutes || 15), 0))}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block font-mono uppercase">DEADLINE</span>
                        <span className="text-xs font-bold text-[#E85D75]/90 mt-0.5 block">Immediate</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block font-mono uppercase">SUBTASKS</span>
                        <span className="text-xs font-bold text-cyan-400 mt-0.5 block">{completedSteps} / {totalSteps} Steps</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-5">
                      <motion.button
                        initial="initial"
                        whileHover="hover"
                        whileTap="active"
                        variants={{
                          initial: {
                            y: 0,
                            scale: 1,
                            background: "linear-gradient(to bottom, #E85D75, #D9485F)",
                            boxShadow: "0 0 0px rgba(232, 93, 117, 0)",
                          },
                          hover: {
                            y: -2,
                            scale: 1.02,
                            background: "linear-gradient(to bottom, #D9485F, #C43D53)",
                            boxShadow: "0 4px 14px rgba(232, 93, 117, 0.35)",
                          },
                          active: {
                            scale: 0.98,
                            background: "linear-gradient(to bottom, #C43D53, #C43D53)",
                          }
                        }}
                        transition={{
                          type: "tween",
                          ease: "easeOut",
                          duration: 0.25,
                        }}
                        onClick={() => navigate('/app/focus-room')}
                        className="flex-1 h-10 text-white rounded-[12px] cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold select-none border border-[#E85D75]/25"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white text-white/95 mr-1" />
                        <span>Start Recovery Sprint</span>
                        <motion.span
                          variants={{
                            hover: { x: 5 }
                          }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="ml-0.5"
                        >
                          →
                        </motion.span>
                      </motion.button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReschedule}
                        className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs font-medium px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        Reschedule
                      </Button>
                    </div>
                  </div>

                  {/* Checklist steps */}
                  <div className="space-y-3 pt-2 text-left">
                    <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                      ACTION ROADMAP
                    </span>
                    
                    <div className="space-y-3">
                      {recoveryPlan.map((step) => (
                        <motion.div
                          key={step.id}
                          onClick={() => handleToggleStep(step.id)}
                          whileHover={{ y: -2 }}
                          className={`p-4 bg-zinc-950/80 backdrop-blur-xl border border-white/[0.04] rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                            step.completed ? 'opacity-50' : ''
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            step.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-transparent'
                          }`}>
                            {step.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-bold block truncate ${step.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                              {step.title}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>
                    {/* Right Panel: Advisor + Confidence */}
              <div className="lg:col-span-3 space-y-6">
                {/* Confidence */}
                <div className="space-y-4 text-left">
                  <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                    RECOVERY CONFIDENCE
                  </span>
                  
                  <div className="flex items-center gap-4 bg-zinc-900/20 border border-white/[0.04] p-6 rounded-2xl">
                    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r={20}
                          className="stroke-zinc-800"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="28"
                          cy="28"
                          r={20}
                          className="stroke-[#E85D75]"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 20}
                          initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 20) - (recoverySuccessPrediction / 100) * (2 * Math.PI * 20) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute text-[11px] font-mono font-bold text-white">
                        <AnimatedPercentage value={recoverySuccessPrediction} duration={1500} />
                      </span>
                    </div>

                    <div className="text-left space-y-0.5">
                      <h4 className="text-[11px] font-bold text-white">Confidence</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal font-light">
                        All critical tasks estimated within safety parameters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assistant Advice */}
                <div className="space-y-4 text-left">
                  <span className="text-xs sm:text-sm font-black text-white font-mono tracking-[0.15em] uppercase block">
                    CHRONO ASSISTANT
                  </span>
                  
                  <Card className="p-5 bg-zinc-900/10 border border-white/[0.05] flex flex-col gap-3 relative overflow-hidden rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <AssistantAvatar isThinking={true} />
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white">COACH ADVICE</h4>
                        <span className="text-[8px] font-mono text-[#E85D75] block uppercase">SPRINT ACTIVE</span>
                      </div>
                    </div>

                    <div className="bg-[#E85D75]/5 border border-[#E85D75]/10 p-3.5 rounded-lg text-[10px] text-zinc-300 min-h-[90px] flex flex-col justify-between">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={recIndex}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="text-[11px] font-medium leading-relaxed text-left"
                        >
                          "{RECOMMENDATIONS[recIndex]}"
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </Card>
                </div>
              </div>          </div>

            </div>
          )}

        </div>
      )}

    </motion.div>
  );
};
