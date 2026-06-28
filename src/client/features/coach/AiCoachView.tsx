/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Activity, 
  User, 
  RefreshCw,
  AlertTriangle,
  Clock,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers,
  Zap,
  Flame,
  ArrowRight,
  ShieldAlert,
  Check,
  CheckCircle,
  Timer,
  LineChart,
  Brain,
  Cpu,
  Bookmark
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { useUiStore } from '../../store/ui.store';
import { useTaskStore } from '../../store/task.store';
import { useFocusStore } from '../../store/focus.store';
import { usePanicStore } from '../../store/panic.store';
import { useAuthStore } from '../../store/auth.store';
import { CoachMessage } from '../../../types';
import { speechService } from "../../utils/speech";
interface CoachRecommendation {
  recommendation: string;
  priorityTasks: Array<{
    taskId?: string;
    title: string;
    priority: string;
    reason: string;
  }>;
  scheduleSuggestions: Array<{
    timeSlot: string;
    activity: string;
    reason: string;
  }>;
  riskWarnings: Array<{
    title: string;
    warning: string;
    riskScore: number;
  }>;
}

// Memory Recall bubble nodes
interface SmartMemoryCard {
  timeframe: string;
  observation: string;
  recommendation: string;
  actionLabel?: string;
  actionPath?: string;
}

const MEMORIES: SmartMemoryCard[] = [
  {
    timeframe: "Yesterday",
    observation: "You completed backend engineering tasks 34% faster after 8:00 PM.",
    recommendation: "Schedule your high-intensity technical blocks after dinner tonight.",
    actionLabel: "Plan Sprints",
  },
  {
    timeframe: "Last Week",
    observation: "Focus Room sessions increased your productivity yield by 28%.",
    recommendation: "Activate a 50-minute Focus block now to clear remaining backlog blockers.",
    actionLabel: "Launch Focus Room",
    actionPath: "/app/focus-room"
  }
];

const INSIGHTS = [
  { 
    title: "Peak Productivity", 
    text: "You complete backend tasks 24% faster after 8PM.", 
    icon: Clock, 
    accent: "text-blue-400",
    confidence: "95% Match",
    generatedAt: "Generated 1 min ago"
  },
  { 
    title: "Optimal Velocity Day", 
    text: "Tuesday has historically been your highest productivity day.", 
    icon: Calendar, 
    accent: "text-cyan-400",
    confidence: "92% Match",
    generatedAt: "Generated 3 mins ago"
  },
  { 
    title: "Cognitive Fatigue Window", 
    text: "Long study sessions above 3 hours reduce focus by 31%.", 
    icon: Brain, 
    accent: "text-indigo-400",
    confidence: "88% Match",
    generatedAt: "Generated 5 mins ago"
  },
  { 
    title: "Deep Work Multiplication", 
    text: "Focus Room sessions improve completion rate by 28%.", 
    icon: Zap, 
    accent: "text-violet-400",
    confidence: "94% Match",
    generatedAt: "Generated 10 mins ago"
  }
];

// Count-up animations for metrics with micro-pulse animation on update
const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 1200, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const pulseTimer = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(pulseTimer);
  }, [value]);

  useEffect(() => {
    let start = 0;
    const end = Math.round(value);
    if (start === end) {
      setCount(end);
      return;
    }
    const totalMs = duration;
    const steps = 40;
    const stepTime = Math.max(Math.floor(totalMs / steps), 16);
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easeOut);
      
      setCount(currentVal);

      if (step >= steps) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.15, 1], color: ["#fff", "#3b82f6", "#fff"] } : {}}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {count}{suffix}
    </motion.span>
  );
};

// Custom typewriter typing effect for high-fidelity ChatGPT flow
const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const words = text.split(" ");
    setDisplayedText("");
    
    const interval = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(prev => prev + (prev ? " " : "") + words[index]);
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 45);
    
    return () => clearInterval(interval);
  }, [text, onComplete]);
  
  return (
    <span>
      {formatMessageText(displayedText)}
      <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 align-middle animate-pulse" />
    </span>
  );
};

// Custom premium progress bar with soft gradient animations - viewport visible only once
const PremiumProgressBar: React.FC<{ value: number; colorClass?: string }> = ({ value, colorClass = "from-indigo-500 to-violet-500" }) => {
  return (
    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/[0.03]">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
      />
    </div>
  );
};

// Custom text markdown formatter
const formatMessageText = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    let content: React.ReactNode = line;
    const isBullet = line.trim().startsWith('•');
    let cleanLine = line;
    if (isBullet) {
      cleanLine = line.replace('•', '').trim();
    }

    const parts = cleanLine.split(/\*\*([^*]+)\*\*/g);
    if (parts.length > 1) {
      content = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="font-bold text-indigo-300">{part}</strong>;
        }
        return part;
      });
    }

    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-4 list-disc text-zinc-300 font-light text-xs sm:text-sm leading-relaxed mb-1.5">
          {content}
        </li>
      );
    }

    return (
      <p key={lineIdx} className="text-zinc-300 font-light text-xs sm:text-sm leading-relaxed mb-2.5">
        {content}
      </p>
    );
  });
};

// Apple-style ambient glow backdrop particles
const PremiumBackgroundEffects: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/[0.02] blur-[140px]" />
      <div className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[110px]" />
      
      <div className="absolute inset-0 opacity-[0.25]">
        <motion.div
          animate={{
            y: [0, -25, 0],
            opacity: [0.1, 0.35, 0.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
          }}
          className="absolute top-[18%] left-[22%] w-1.5 h-1.5 rounded-full bg-blue-400"
        />
        <motion.div
          animate={{
            y: [0, -40, 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
            delay: 3,
          }}
          className="absolute top-[48%] left-[68%] w-2 h-2 rounded-full bg-indigo-400 blur-[0.5px]"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
            delay: 5,
          }}
          className="absolute bottom-[28%] left-[42%] w-1 h-1 rounded-full bg-cyan-400"
        />
      </div>
    </div>
  );
};

// Live ticker bar with rotating steps every 4 seconds and smooth fade in/out
const ChronoStatusTicker: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "✓ Workspace synced",
    "Analyzing deadlines...",
    "Checking calendar...",
    "Optimizing schedule...",
    "Building focus plan...",
    "Prioritizing tasks...",
    "Ready."
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
      setSecondsLeft(4);
    }, 4000);

    const secInterval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 4 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(secInterval);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 bg-zinc-950/60 border border-white/[0.04] rounded-2xl text-left text-xs text-zinc-400 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="font-mono font-bold text-white tracking-wide uppercase">Chrono Live</span>
      </div>
      <div className="hidden sm:block h-3.5 w-px bg-white/[0.08]" />
      <div className="flex-1 flex items-center h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.42, 0, 0.58, 1] }}
            className="font-light text-zinc-300 block"
          >
            {steps[currentStep]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="hidden md:block h-3.5 w-px bg-white/[0.08]" />
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest self-start sm:self-auto">
        Next sync in <strong className="text-blue-400 font-bold font-mono">{secondsLeft}s</strong>
      </div>
    </div>
  );
};

// Glowing floating AI orb with slow breathing, soft pulse, gentle rotation, and slight glow
const ChronoAvatar: React.FC<{ isThinking: boolean; isResponding: boolean }> = ({ isThinking, isResponding }) => {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Outer rotating/pulsating glowing ring */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: isThinking ? [1, 1.25, 1] : [1, 1.05, 1],
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }
        }}
        className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-500 ${
          isThinking ? 'border-blue-400/50' : 'border-blue-500/15'
        }`}
      />
      
      {/* Dynamic breathing back-glow - gets stronger when thinking */}
      <motion.div
        animate={{
          scale: isThinking ? [1.2, 1.6, 1.2] : [1, 1.3, 1],
          opacity: isThinking ? [0.65, 0.95, 0.65] : [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: isThinking ? 1.5 : 4.5,
          repeat: Infinity,
          ease: [0.42, 0, 0.58, 1],
        }}
        className={`absolute inset-[-6px] rounded-full blur-xl pointer-events-none transition-all duration-500 bg-gradient-to-r from-blue-500/40 via-cyan-400/35 to-indigo-500/40`}
      />

      {/* Glassmorphic floating inner orb */}
      <motion.div
        className="relative w-9 h-9 rounded-full bg-zinc-950/85 border border-white/[0.08] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden"
        animate={{
          y: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: [0.42, 0, 0.58, 1]
        }}
      >
        {/* Subtle radial inner shine */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
        
        <Sparkles className={`w-4 h-4 transition-colors duration-500 ${isThinking ? 'text-cyan-300 animate-pulse' : 'text-blue-400'}`} />
      </motion.div>

      {/* Small online indicator */}
      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
    </div>
  );
};

// Smart AI typing/thinking animation indicator with animated dots
const ChronoTypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 px-1 py-0.5">
      <span className="text-xs font-mono text-zinc-400 font-medium">Thinking</span>
      <div className="flex items-center gap-1">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
        />
      </div>
    </div>
  );
};

// Compact collapsible AI Decision explanation card
const DecisionEngineCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-blue-500/10 rounded-xl bg-blue-950/[0.03] overflow-hidden">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase text-left outline-none"
      >
        <span className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Why this recommendation?
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">{isOpen ? 'COLLAPSE ▲' : 'EXPAND ▼'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="px-3.5 pb-3.5 pt-1 border-t border-white/[0.02] text-left space-y-2.5"
          >
            <ul className="space-y-1.5 text-[11px] text-zinc-400 font-light list-disc pl-4 pt-1.5">
              <li>Backend blocks 3 remaining deliverables.</li>
              <li>Calendar has a free 2 hour window.</li>
              <li>Evening productivity is historically +24%.</li>
              <li>Estimated deadline risk drops from 78% to 39%.</li>
            </ul>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
              <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase">Confidence Score</span>
              <span className="text-xs font-mono font-black text-emerald-400">94% Confidence</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Render items beautifully inside the chat bubble
const CoachMessageBubble: React.FC<{
  msg: CoachMessage;
  isLatest: boolean;
  onNavigate: (path: string) => void;
  onApplyPlan: () => void;
  loading: boolean;
}> = ({ msg, isLatest, onNavigate, onApplyPlan, loading }) => {
  const [streamCompleted, setStreamCompleted] = useState(!isLatest);
  
  let parsedData: CoachRecommendation | null = null;
  let isJson = false;
  try {
    parsedData = JSON.parse(msg.text);
    isJson = true;
  } catch (e) {
    // normal raw text
  }

  // Auto trigger text animation complete for old items
  useEffect(() => {
    if (!isLatest) {
      setStreamCompleted(true);
    }
  }, [isLatest]);

  return (
    <div className="space-y-4">
      {isJson && parsedData ? (
        <>
          <div className="text-zinc-200 text-xs sm:text-sm font-medium leading-relaxed">
            {isLatest && !streamCompleted ? (
              <TypewriterText 
                text={parsedData.recommendation} 
                onComplete={() => setStreamCompleted(true)} 
              />
            ) : (
              <div>{formatMessageText(parsedData.recommendation)}</div>
            )}
          </div>

          <AnimatePresence>
            {streamCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4 pt-1"
              >
                {/* Priority Targets with premium layouts */}
                {parsedData.priorityTasks && parsedData.priorityTasks.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                    <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-400" /> RECOMMENDED PRIORITY DELIVERABLES
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {parsedData.priorityTasks.map((t, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                          className="p-4 bg-zinc-900/40 border border-blue-500/10 hover:border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01),0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.04)]"
                        >
                          <div className="space-y-1.5 text-left flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white">{t.title}</span>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                🔥 HIGH IMPACT
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-light">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" /> Save {idx === 0 ? 42 : 30} mins</span>
                              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-cyan-400" /> {idx === 0 ? 95 : 91}% Confidence</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 self-start sm:self-auto">
                            <Button
                              size="sm"
                              onClick={() => onNavigate('/app/focus-room')}
                              className="bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all duration-250 active:scale-95"
                            >
                              <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" /> Start Focus
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calendar suggestions */}
                {parsedData.scheduleSuggestions && parsedData.scheduleSuggestions.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                    <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> TIMELINE ADJUSTMENTS
                    </h4>
                    <div className="relative border-l border-zinc-800 pl-4 ml-2.5 space-y-4 py-1 text-left">
                      {parsedData.scheduleSuggestions.map((s, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-zinc-950 shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono font-bold text-cyan-400">{s.timeSlot}</span>
                            <span className="text-xs font-bold text-white">{s.activity}</span>
                            <span className="text-[11px] text-zinc-400 leading-normal font-light mt-0.5">{s.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1 ml-2.5">
                      <Button
                        size="sm"
                        onClick={onApplyPlan}
                        className="bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold text-zinc-950 px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md active:scale-95 duration-250"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> Apply Plan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('/app/calendar')}
                        className="border-white/[0.06] hover:bg-white/[0.02] text-[10px] font-medium text-zinc-400 px-3.5 py-2 rounded-xl active:scale-95 duration-250"
                      >
                        Calendar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Risk Bottlenecks */}
                {parsedData.riskWarnings && parsedData.riskWarnings.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                    <h4 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> SPRINT RISK ALERTS
                    </h4>
                    <div className="space-y-2.5">
                      {parsedData.riskWarnings.map((w, idx) => (
                        <div key={idx} className="p-3.5 bg-rose-500/[0.02] border border-rose-500/[0.08] rounded-xl space-y-2.5 text-left">
                          <div className="flex justify-between items-start gap-3">
                            <span className="text-xs font-bold text-rose-300">{w.title}</span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              RISK: {w.riskScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-normal font-light">{w.warning}</p>
                          <Button
                            size="sm"
                            onClick={() => onNavigate('/app/panic-mode')}
                            className="bg-rose-600/80 hover:bg-rose-600 text-[10px] font-bold text-white px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95 duration-250"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-200" /> Enter Panic Mode
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Decision Engine explanation card */}
                <DecisionEngineCard />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="space-y-3">
          <div className="text-zinc-200 text-xs sm:text-sm font-medium leading-relaxed text-left">
            {isLatest && !streamCompleted ? (
              <TypewriterText 
                text={msg.text} 
                onComplete={() => setStreamCompleted(true)} 
              />
            ) : (
              <div>{formatMessageText(msg.text)}</div>
            )}
          </div>
          {streamCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <DecisionEngineCard />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export const AiCoachView: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const { tasks } = useTaskStore();
  const { completedSessions } = useFocusStore();
  const { completedPanics } = usePanicStore();
  const { user } = useAuthStore();

 const userFirstName = useMemo(() => {
  if (user?.fullName?.trim()) {
    return user.fullName;
  }

  if (user?.email) {
      const parts = user.email.split('@')[0].split('.')[0].split('_')[0];
      let clean = parts.replace(/[0-9]/g, '');
      
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return 'User';
  }, [user]);

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [successActive, setSuccessActive] = useState(false);
  const [isActivatingFocus, setIsActivatingFocus] = useState(false);
  const [isListening, setIsListening] = useState(false);

  
  const handleActivateFocus = () => {
    setIsActivatingFocus(true);
    setTimeout(() => {
      navigate('/app/focus-room');
    }, 1200);
  };
  
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Insights rotation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % INSIGHTS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Compute workspace performance metrics
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'COMPLETED'), [tasks]);
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'COMPLETED') return false;
      return t.status === 'OVERDUE' || (t.deadline && new Date(t.deadline) < new Date());
    });
  }, [tasks]);

  const criticalTasksCount = useMemo(() => tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length, [tasks]);
  const highTasksCount = useMemo(() => tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length, [tasks]);
  const mediumTasksCount = useMemo(() => tasks.filter(t => t.priority === 'MEDIUM' && t.status !== 'COMPLETED').length, [tasks]);

  const totalFocusMinutes = useMemo(() => {
    return completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [completedSessions]);

  const riskScore = useMemo(() => {
    const base = (overdueTasks.length * 28) + (activeTasks.length * 6);
    return Math.min(100, Math.max(0, base));
  }, [overdueTasks, activeTasks]);

  const focusReadiness = useMemo(() => {
    const base = 70 + (user?.currentStreak || 5) * 3 + (completedSessions.length * 2) - (overdueTasks.length * 8);
    return Math.min(100, Math.max(12, base));
  }, [user, completedSessions, overdueTasks]);

  const totalFocusNeededMinutes = useMemo(() => {
    return activeTasks.reduce((sum, t) => sum + (t.estimatedTime || 45), 0);
  }, [activeTasks]);

  const focusNeededFormatted = useMemo(() => {
    if (totalFocusNeededMinutes === 0) return '0h';
    const h = Math.floor(totalFocusNeededMinutes / 60);
    const m = totalFocusNeededMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [totalFocusNeededMinutes]);

  const successProbability = useMemo(() => {
    const base = 85 + (completedSessions.length * 3.5) - (overdueTasks.length * 7);
    return Math.min(99, Math.max(45, Math.round(base)));
  }, [completedSessions, overdueTasks]);

  const greetingByTime = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Initialize live conversation history with actual task parameters on mount
  useEffect(() => {
    const welcomeText = `Good evening ${userFirstName} 👋\n\nI've analyzed today's workload. You currently have **${criticalTasksCount} Critical Tasks**, **${mediumTasksCount} Medium Priority Tasks**, and your focus readiness index is **${focusReadiness}%**.\n\nWould you like me to optimize your daily study blocks, prioritize backlog deliverables, or formulate an active recovery plan?`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'coach',
        text: JSON.stringify({
          recommendation: welcomeText,
          priorityTasks: activeTasks.slice(0, 2).map(t => ({
            title: t.title,
            priority: t.priority,
            reason: "Safe target. Lock in deep performance blocks."
          })),
          scheduleSuggestions: [],
          riskWarnings: overdueTasks.length > 0 ? [{
            title: "Overdue Timeline Gap",
            warning: `You have ${overdueTasks.length} overdue task(s). Chrono recommends establishing critical recovery buffers immediately.`,
            riskScore
          }] : []
        }),
        createdAt: new Date().toISOString(),
        suggestions: [
          'Optimize Today',
          'Prioritize Tasks',
          'Explain Workload',
          'Rescue Deadlines'
        ]
      }
    ]);
  }, [userFirstName, tasks.length]);

  const triggerSuccess = () => {
    setSuccessActive(true);
    addToast('Schedule Applied', 'Chrono Coach has synchronized this action plan with your timeline.', 'success');
    setTimeout(() => setSuccessActive(false), 2400);
  };
const handleVoiceInput = async () => {
  try {
    setIsListening(true);

    const transcript = await speechService.startListening();

    setInputText(transcript);

    // Optional: automatically send
    handleSendMessage(transcript);

  } catch (err) {
    console.error(err);
  } finally {
    setIsListening(false);
  }
};
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: CoachMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const apiStartTime = Date.now();
    const delayAtLeastTwoSeconds = async () => {
      const elapsed = Date.now() - apiStartTime;
      const remain = 2000 - elapsed;
      if (remain > 0) {
        await new Promise(r => setTimeout(r, remain));
      }
    };

    try {
      // High-fidelity local custom flows for core actions to guarantee gorgeous Linear/Apple OS fidelity
      if (text === 'Optimize Today') {
        await delayAtLeastTwoSeconds();
        const optimizeReply: CoachMessage = {
          id: `msg-c-opt-${Date.now()}`,
          sender: 'coach',
          text: JSON.stringify({
            recommendation: `Optimization strategy configured, ${userFirstName}. I have mapped out your critical performance windows, optimizing for cognitive recovery intervals.`,
            priorityTasks: activeTasks.slice(0, 2).map(t => ({
              title: t.title,
              priority: t.priority,
              reason: "Key driver of study velocity. Schedule for early execution."
            })),
            scheduleSuggestions: [
              { timeSlot: "10:00 AM - 11:30 AM", activity: "High-Cognitive Block", reason: "Deploy on difficult logical or engineering bottlenecks." },
              { timeSlot: "02:00 PM - 02:45 PM", activity: "Administrative Overhead", reason: "Resolve communication and quick task backlog items." },
              { timeSlot: "08:00 PM - 09:30 PM", activity: "Peak Flow Sprint", reason: "Synchronized with your peak historical evening velocity." }
            ],
            riskWarnings: []
          }),
          createdAt: new Date().toISOString(),
          suggestions: ['Prioritize Tasks', 'Explain Workload']
        };
        setMessages(prev => [...prev, optimizeReply]);
        return;
      }

      if (text === 'Prioritize Tasks') {
        await delayAtLeastTwoSeconds();
        const prioritizeReply: CoachMessage = {
          id: `msg-c-pri-${Date.now()}`,
          sender: 'coach',
          text: JSON.stringify({
            recommendation: `Workload prioritization synchronized, ${userFirstName}. I have sorted your active tasks by delivery weight parameters and time risk margins. Complete these items to guarantee your streak is protected:`,
            priorityTasks: activeTasks.slice(0, 3).map(t => ({
              title: t.title,
              priority: t.priority,
              reason: `Vulnerable target. Expected completion requirement: ${t.estimatedTime || 45} minutes.`
            })),
            scheduleSuggestions: [],
            riskWarnings: overdueTasks.length > 0 ? [{
              title: "Overdue Timeline Debt",
              warning: "Your overdue items represent a severe drag on workspace velocity. Clear first.",
              riskScore: 91
            }] : []
          }),
          createdAt: new Date().toISOString(),
          suggestions: ['Optimize Today', 'Explain Workload']
        };
        setMessages(prev => [...prev, prioritizeReply]);
        return;
      }

      if (text === 'Explain Workload') {
        await delayAtLeastTwoSeconds();
        const explainReply: CoachMessage = {
          id: `msg-c-exp-${Date.now()}`,
          sender: 'coach',
          text: JSON.stringify({
            recommendation: `Workload breakdown complete, ${userFirstName}:\n\n• Your **Focus Index is ${focusReadiness}%**.\n• Current **Stress indicators are ${overdueTasks.length * 20 + 20}%**.\n• Combined **Deadline Risk Index is at ${riskScore}%**.\n\nYour task density indicates a minor saturation around upcoming sprints. I recommend blocking out a 50-minute dedicated sprint session in the Focus Room to buffer your schedule.`,
            priorityTasks: [],
            scheduleSuggestions: [],
            riskWarnings: []
          }),
          createdAt: new Date().toISOString(),
          suggestions: ['Optimize Today', 'Rescue Deadlines']
        };
        setMessages(prev => [...prev, explainReply]);
        return;
      }

      if (text === 'Rescue Deadlines' || text === 'Rescue My Deadlines') {
        await delayAtLeastTwoSeconds();
        const rescueReply: CoachMessage = {
          id: `msg-c-res-${Date.now()}`,
          sender: 'coach',
          text: JSON.stringify({
            recommendation: `Active recovery buffer initiated, ${userFirstName}. I have constructed protective buffer parameters to shield your daily streak performance.`,
            priorityTasks: activeTasks.slice(0, 2).map(t => ({
              title: t.title,
              priority: "CRITICAL",
              reason: "Deadline buffer low. Action required to shield active performance."
            })),
            scheduleSuggestions: [
              { timeSlot: "Immediate", activity: "50-Minute Sprint Cycle", reason: "Clear primary bottleneck with active workspace shield enabled." },
              { timeSlot: "Post-Sprint", activity: "Strategic Recovery Block", reason: "15-minute active breather to protect cognitive stamina." }
            ],
            riskWarnings: overdueTasks.map(t => ({
              title: t.title,
              warning: "High threat. Immediate focused sprint highly recommended.",
              riskScore: 94
            }))
          }),
          createdAt: new Date().toISOString(),
          suggestions: ['Optimize Today', 'Explain Workload']
        };
        setMessages(prev => [...prev, rescueReply]);
        return;
      }

      // Hybrid custom prompt API query fallback
      const focusStats = {
        completedLoopsCount: completedSessions.length,
        totalFocusMinutes,
        activeStreak: user?.currentStreak || 5
      };

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: text,
          tasks,
          focusStats,
          panicLogs: completedPanics
        })
      });

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const resText = await response.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error('Chrono API returned non-JSON structure.');
      }

      await delayAtLeastTwoSeconds();

      const coachMsg: CoachMessage = {
        id: `msg-c-${Date.now()}`,
        sender: 'coach',
        text: JSON.stringify(data),
        createdAt: new Date().toISOString(),
        suggestions: [
          'Optimize Today',
          'Prioritize Tasks',
          'Explain Workload',
          'Rescue Deadlines'
        ]
      };

      setMessages(prev => [...prev, coachMsg]);
    } catch (error: any) {
      console.error('[Chrono Coach Sync Error]', error);
      const friendlyMessage = "Chrono API Node is temporarily offline. I will simulate a local strategic reply based on your workspace logs.";
      addToast('Sync Interrupted', 'Reverting to offline strategic memory protocols.', 'error');
      
      await delayAtLeastTwoSeconds();

      const fallbackReply: CoachMessage = {
        id: `msg-error-${Date.now()}`,
        sender: 'coach',
        text: JSON.stringify({
          recommendation: `Chrono Live synchronization was interrupted, ${userFirstName}. Reverted to secure local cache. Based on your tasks list, you have **${criticalTasksCount} critical items** requiring focus buffers today. Let me know if you would like to structure an active Focus block.`,
          priorityTasks: activeTasks.slice(0, 1).map(t => ({
            title: t.title,
            priority: t.priority,
            reason: "Priority backlog item cached locally."
          })),
          scheduleSuggestions: [],
          riskWarnings: []
        }),
        createdAt: new Date().toISOString(),
        suggestions: ['Optimize Today', 'Explain Workload']
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto flex flex-col min-h-screen text-zinc-100 p-2 select-none pb-16 relative" id="chrono-flagship-workspace">
      
      {/* Premium Apple/Linear background gradients */}
      <PremiumBackgroundEffects />

      {/* 1. GREETING & HEADER CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-white/[0.04] pb-6 text-left relative z-10">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Bot className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-blue-400 uppercase">AI Productivity Coach</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            👋 {greetingByTime}, {userFirstName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Your personalized productivity mentor for structured focus and active goal recovery.
          </p>
        </div>

        {/* Clean, high-fidelity status header */}
        <div className="flex items-center gap-4 bg-zinc-900/40 border border-white/[0.04] px-4.5 py-2.5 rounded-2xl self-start md:self-auto shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
            <span className="text-xs font-mono font-semibold text-zinc-300">AI Connected</span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="text-xs font-mono font-semibold text-zinc-400 flex items-center gap-1">
            ⚡ <span className="text-amber-400 font-bold font-mono">{user?.currentStreak || 5} Day Streak</span>
          </div>
        </div>
      </div>

      {/* 4. CORE TWO-COLUMN AI WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* LEFT COLUMN: Suggested Actions, Workspace Metrics, Heuristics */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* A. Suggested Actions */}
          <div className="space-y-4 text-left">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              SUGGESTED ACTIONS
            </span>
            <div className="grid grid-cols-1 gap-4">
              {[
                { 
                  title: "Daily Summary", 
                  desc: "Analyze progress and focus trends", 
                  prompt: "Explain My Workload", 
                  icon: Activity,
                  impact: "Save 45 mins",
                  confidence: "95% Match",
                  priority: "SUMMARY",
                  accent: "group-hover:text-blue-400 border-blue-500/10 group-hover:border-blue-500/20",
                  hoverGlow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:border-blue-500/30"
                },
                { 
                  title: "Task Recommendation", 
                  desc: "Identify high impact targets", 
                  prompt: "Prioritize Tasks", 
                  icon: Layers,
                  impact: "Save 30 mins",
                  confidence: "91% Match",
                  priority: "FOCUS",
                  accent: "group-hover:text-cyan-400 border-cyan-500/10 group-hover:border-cyan-500/20",
                  hoverGlow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group-hover:border-cyan-500/30"
                },
                { 
                  title: "Weekly Review", 
                  desc: "Retrospective of focus metrics", 
                  prompt: "Explain My Workload", 
                  icon: LineChart,
                  impact: "Deep Clarity",
                  confidence: "94% Match",
                  priority: "RETROSPECTIVE",
                  accent: "group-hover:text-violet-400 border-violet-500/10 group-hover:border-violet-500/20",
                  hoverGlow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] group-hover:border-violet-500/30"
                },
                { 
                  title: "Plan My Day", 
                  desc: "Structure today's study blocks", 
                  prompt: "Optimize Today", 
                  icon: Calendar,
                  impact: "Save 40 mins",
                  confidence: "92% Match",
                  priority: "TIMELINE",
                  accent: "group-hover:text-emerald-400 border-emerald-500/10 group-hover:border-emerald-500/20",
                  hoverGlow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/30"
                }
              ].map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(card.prompt)}
                    className={`p-4.5 bg-zinc-900/30 hover:bg-blue-950/5 border border-white/[0.04] rounded-2xl cursor-pointer group transition-all duration-300 relative overflow-hidden text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] ${card.hoverGlow}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-2 relative z-10">
                      <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-blue-500/10 transition-colors">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconComp className={`w-4 h-4 text-zinc-400 ${card.accent} transition-colors duration-300`} />
                        </motion.div>
                      </div>
                      <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors tracking-wide">{card.title}</span>
                    </div>
                    
                    <p className="text-[11px] text-zinc-400 leading-normal font-light mb-3 relative z-10">{card.desc}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] text-[9px] font-mono font-semibold text-zinc-500 relative z-10">
                      <span className="text-blue-400/85">{card.impact}</span>
                      <span className="text-zinc-400">{card.confidence}</span>
                      <span className="text-zinc-500">{card.priority}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Chat Terminal */}
        <div className="lg:col-span-7 flex flex-col bg-zinc-950/15 border border-white/[0.04] rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[600px] lg:h-[calc(100vh-200px)]">
          
          {/* Frosted Chat Header Section */}
          <div className="bg-zinc-950/60 border-b border-white/[0.04] py-4 px-6 flex items-center justify-between z-10 flex-shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <ChronoAvatar 
                isThinking={loading} 
                isResponding={messages.length > 1 && messages[messages.length - 1].sender === 'coach' && !loading} 
              />
              <div className="text-left">
                <h3 className="text-sm font-black text-white tracking-wide">AI Coach</h3>
                <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">
                  {loading ? 'THINKING...' : 'ONLINE'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-[9px] font-mono tracking-wider text-blue-300 shadow-inner">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span>ACTIVE SESSION</span>
            </div>
          </div>

          {/* Messages container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none flex flex-col">
            {messages.map((msg, index) => {
              const isCoach = msg.sender === 'coach';
              return (
                <div key={msg.id} className="space-y-3.5">
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 18 }}
                    className={`flex gap-3.5 max-w-[85%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Tiny avatar indicators */}
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center flex-shrink-0 border shadow-md text-[10px] font-bold ${
                      isCoach 
                        ? 'bg-zinc-950/80 border-white/[0.06] text-blue-400' 
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400/20 text-white'
                    }`}>
                      {isCoach ? <Sparkles className="w-3.5 h-3.5 text-blue-400" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Message body bubbles */}
                      <div className={`p-4 sm:p-5 rounded-2xl border relative overflow-visible shadow-[0_8px_20px_rgba(0,0,0,0.15)] text-left ${
                        isCoach 
                          ? 'bg-zinc-950/65 border-blue-500/20 shadow-[0_4px_24px_rgba(59,130,246,0.06)] text-zinc-200 backdrop-blur-md hover:border-blue-500/30 transition-colors' 
                          : 'bg-blue-600/15 border-blue-500/30 text-white backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:border-blue-500/40 transition-colors'
                      }`}>
                        <CoachMessageBubble 
                          msg={msg} 
                          isLatest={index === messages.length - 1} 
                          onNavigate={navigate} 
                          onApplyPlan={triggerSuccess}
                          loading={loading}
                        />
                      </div>

                      {/* Suggestions list */}
                      {isCoach && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2 pt-2 justify-start">
                          {msg.suggestions.map(s => (
                            <motion.button
                              key={s}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              disabled={loading}
                              onClick={() => handleSendMessage(s)}
                              className="px-4 py-2 rounded-full border border-white/[0.05] bg-zinc-950/40 text-[10px] sm:text-xs font-semibold text-zinc-400 hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5 transition-all cursor-pointer disabled:opacity-50 shadow-md outline-none"
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Smart Memory cards insertion naturally into conversation */}
                  {isCoach && index === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="ml-12 pl-1.5 space-y-3.5 max-w-[85%] text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-blue-400/80" />
                        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">Smart Memory Recall</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {MEMORIES.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-4 bg-zinc-950/50 border border-white/[0.04] hover:border-indigo-500/15 rounded-2xl space-y-2 relative overflow-hidden transition-all duration-300"
                          >
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10">
                              {m.timeframe}
                            </span>
                            <p className="text-xs font-medium text-white leading-relaxed pt-1">{m.observation}</p>
                            <p className="text-[11px] text-zinc-400 font-light leading-normal">{m.recommendation}</p>
                            {m.actionPath && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(m.actionPath!)}
                                className="border-indigo-500/10 hover:bg-indigo-500/5 text-[9px] text-indigo-300 font-bold px-2.5 py-1.5 rounded-lg mt-2 w-full justify-center flex items-center"
                              >
                                {m.actionLabel}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Pulsing thinking animation */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[85%] text-left"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-zinc-950/80 border-white/[0.08] text-blue-400 shadow-md">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-5 bg-zinc-900/30 border border-white/[0.06] rounded-2xl shadow-xl relative overflow-hidden min-w-[280px] backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
                  <ChronoTypingIndicator />
                </div>
              </motion.div>
            )}
          </div>

          {/* Frosted Command bar message input */}
          <div className="flex items-center gap-3">
  <input
    type="text"
    value={inputText}
    disabled={loading}
    onChange={(e) => setInputText(e.target.value)}
    placeholder="Ask AI Coach to summarize progress, prioritize tasks, or suggest schedules..."
    onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
    className="flex-1 px-5 py-3.5 text-xs sm:text-sm bg-white/[0.01] border border-white/[0.06] focus:border-blue-500/40 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-white placeholder-zinc-500 disabled:opacity-50 transition-all font-light"
  />

  <button
    type="button"
    onClick={handleVoiceInput}
    disabled={isListening || loading}
    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
      isListening
        ? "bg-red-500 text-white animate-pulse"
        : "bg-violet-600 hover:bg-violet-700 text-white"
    }`}
  >
    {isListening ? "🎙️" : "🎤"}
  </button>
</div>
        </div>

      </div>

      {/* Synchronized timeline success dialog overlay */}
      <AnimatePresence>
        {successActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.85, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 15 }}
              transition={{ type: "spring", damping: 15 }}
              className="p-6.5 rounded-3xl bg-zinc-900 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                className="w-13 h-13 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
              >
                <Check className="w-6 h-6 stroke-[3.5px]" />
              </motion.div>
              <div>
                <h3 className="text-sm font-black text-white">Schedule Synchronized</h3>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 uppercase tracking-[0.15em]">TIMELINE UPDATED SUCCESSFULLY</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
