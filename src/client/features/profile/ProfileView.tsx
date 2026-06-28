/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Award, Flame, Clock, Save, Bot, Activity, Calendar, 
  ShieldCheck, CheckCircle2, Zap, ChevronRight, Sparkles, Globe, 
  Cpu, GitBranch, Play, FileText, Database, Mail, RefreshCw, 
  Sliders, Lock, Trophy, Compass, Briefcase, Share2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { useNavigate } from 'react-router-dom';

// Import our modular custom components
import { 
  SHARED_STYLES, 
  CountUp, 
  PremiumCard, 
  InteractiveAvatar, 
  AnimatedXPProgressBar, 
  RadialStat 
} from './ProfileComponents';

import { 
  AchievementBadge, 
  MemoryRegisterCard, 
  ConnectedServiceCard,
  WorkspaceHealthDashboard
} from './WorkspaceAndMemory';

import { 
  TimelineLine, 
  TimelineItem, 
  FloatingAIStatus, 
  FloatingBackground 
} from './TimelineComponents';

import { SkeletonScreen } from './SkeletonScreen';
import { ShareModal } from './ShareModal';

// --------------------------------------------------
// TIMEZONE GETTER UTILITY
// --------------------------------------------------
const getTimezoneInfo = (tz: string, dateObj?: Date) => {
  try {
    const now = dateObj || new Date();
    
    // Timezone names using Intl
    const longFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'long',
    });
    const longName = longFormatter.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';

    const shortFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const shortName = shortFormatter.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';

    // Calculate offset minute difference
    const utcString = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const targetString = now.toLocaleString('en-US', { timeZone: tz });
    
    const utcDate = new Date(utcString);
    const targetDate = new Date(targetString);
    
    const diffMs = targetDate.getTime() - utcDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const absMins = Math.abs(diffMins);
    const hrs = Math.floor(absMins / 60);
    const mins = absMins % 60;
    const sign = diffMins >= 0 ? '+' : '-';
    const offset = `UTC ${sign}${hrs}:${mins.toString().padStart(2, '0')}`;

    // Format current time and date
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const currentTime = timeFormatter.format(now);

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentDate = dateFormatter.format(now);

    return {
      iana: tz,
      offset,
      name: shortName ? `${longName} (${shortName})` : longName,
      currentTime,
      currentDate,
    };
  } catch (error) {
    return {
      iana: tz,
      offset: 'UTC +0:00',
      name: 'Coordinated Universal Time',
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString(),
    };
  }
};

// --------------------------------------------------
// PREMIUM FLOATING LABEL INPUT
// --------------------------------------------------
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  error?: string;
  isSuccess?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  error,
  isSuccess,
  className = "",
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full group mt-4 text-left">
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-focus-within:opacity-25 blur-xs transition-opacity duration-300 pointer-events-none" />
      
      <div className={`relative flex items-center bg-zinc-950 border rounded-xl transition-all duration-300 ${
        error 
          ? "border-rose-500" 
          : isSuccess 
            ? "border-emerald-500" 
            : "border-white/[0.05] group-hover:border-white/10 focus-within:border-blue-500"
      }`}>
        <motion.label
          initial={false}
          animate={{
            y: (isFocused || hasValue) ? -20 : 0,
            scale: (isFocused || hasValue) ? 0.8 : 1,
            color: isFocused ? "#3b82f6" : "#71717a",
            backgroundColor: (isFocused || hasValue) ? "#09090b" : "transparent"
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute left-3 px-1 text-xs pointer-events-none select-none z-10 font-medium origin-left"
        >
          {label}
        </motion.label>

        <input
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          className={`w-full px-3.5 py-3 bg-transparent text-xs text-zinc-200 focus:outline-none z-0 rounded-xl ${props.disabled ? 'cursor-not-allowed text-zinc-500' : ''} ${className}`}
          {...props}
        />
        
        <div className="absolute right-3 flex items-center pointer-events-none">
          {error && <span className="text-rose-500 text-[10px] font-mono">Invalid</span>}
          {!error && isSuccess && <span className="text-emerald-500 text-[10px] font-mono">Valid</span>}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// PREMIUM FLOATING LABEL TEXTAREA
// --------------------------------------------------
interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  maxChar?: number;
  error?: string;
  isSuccess?: boolean;
}

export const FloatingLabelTextarea: React.FC<FloatingTextareaProps> = ({
  label,
  value,
  maxChar = 200,
  error,
  isSuccess,
  className = "",
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full group mt-4 text-left">
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-focus-within:opacity-25 blur-xs transition-opacity duration-300 pointer-events-none" />

      <div className={`relative bg-zinc-950 border rounded-xl transition-all duration-300 ${
        error 
          ? "border-rose-500" 
          : isSuccess 
            ? "border-emerald-500" 
            : "border-white/[0.05] group-hover:border-white/10 focus-within:border-blue-500"
      }`}>
        <motion.label
          initial={false}
          animate={{
            y: (isFocused || hasValue) ? -22 : 0,
            scale: (isFocused || hasValue) ? 0.8 : 1,
            color: isFocused ? "#3b82f6" : "#71717a",
            backgroundColor: (isFocused || hasValue) ? "#09090b" : "transparent"
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute left-3 top-3 px-1 text-xs pointer-events-none select-none z-10 font-medium origin-left"
        >
          {label}
        </motion.label>

        <textarea
          value={value}
          maxLength={maxChar}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          className={`w-full px-3.5 py-3 bg-transparent text-xs text-zinc-200 focus:outline-none z-0 rounded-xl resize-none ${className}`}
          {...props}
        />

        <div className="absolute bottom-2 right-3 flex items-center justify-between text-[8px] font-mono text-zinc-500 pointer-events-none select-none">
          <span>{value.length} / {maxChar}</span>
        </div>
      </div>
    </div>
  );
};


// --------------------------------------------------
// PROFILE MAIN VIEW COMPONENT
// --------------------------------------------------
export const ProfileView: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  // Loading States
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'actions'>('info');

  // Automatic Timezone Detection
  const detectedTz = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch (e) {
      return 'Asia/Kolkata';
    }
  }, []);

  // Form states
  const [occupation, setOccupation] = useState(user?.occupation || 'Software Dev Engineer');
  const [bio, setBio] = useState(user?.bio || 'Computer Science student and freelance web developer working on high-intensity workloads.');
  const [college, setCollege] = useState('University of Computer Science');
  const [timezone, setTimezone] = useState(user?.timezone || detectedTz);
  const [studyMode, setStudyMode] = useState('Midnight Grind');

  // UI state for timezone search select
  const [tzSearch, setTzSearch] = useState('');
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);

  // Profile Saved Success Banner
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  // Interactive UI states for syncing
  const [syncingStates, setSyncingStates] = useState<Record<string, boolean>>({});
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Ref tracking initial values to detect form modifications ("isDirty")
  const initialValues = useRef({
    occupation: user?.occupation || 'Software Dev Engineer',
    bio: user?.bio || 'Computer Science student and freelance web developer working on high-intensity workloads.',
    college: 'University of Computer Science',
    timezone: user?.timezone || detectedTz,
    studyMode: 'Midnight Grind'
  });

  const isDirty = 
    occupation !== initialValues.current.occupation ||
    bio !== initialValues.current.bio ||
    college !== initialValues.current.college ||
    timezone !== initialValues.current.timezone ||
    studyMode !== initialValues.current.studyMode;

  // Clock state ticking every second
  const [now, setNow] = useState(new Date());
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tzInfo = React.useMemo(() => {
    return getTimezoneInfo(timezone, now);
  }, [timezone, now]);

  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, [timezone]);

  // Support list of all global IANA timezones
  const allTimezones = React.useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch (e) {
      return [
        "Africa/Cairo", "Africa/Johannesburg", "America/Anchorage", "America/Argentina/Buenos_Aires",
        "America/Bogota", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Mexico_City",
        "America/New_York", "America/Phoenix", "America/Sao_Paulo", "Asia/Bangkok", "Asia/Dubai",
        "Asia/Hong_Kong", "Asia/Jakarta", "Asia/Jerusalem", "Asia/Kolkata", "Asia/Manila", "Asia/Riyadh",
        "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo", "Atlantic/Reykjavik",
        "Australia/Adelaide", "Australia/Brisbane", "Australia/Melbourne", "Australia/Sydney",
        "Europe/Amsterdam", "Europe/Athens", "Europe/Berlin", "Europe/Brussels", "Europe/Dublin",
        "Europe/London", "Europe/Madrid", "Europe/Moscow", "Europe/Paris", "Europe/Rome", "Europe/Zurich",
        "Pacific/Auckland", "Pacific/Fiji", "Pacific/Honolulu", "UTC"
      ];
    }
  }, []);

  const filteredTimezones = React.useMemo(() => {
    if (!tzSearch) return allTimezones;
    return allTimezones.filter(tz => tz.toLowerCase().includes(tzSearch.toLowerCase()));
  }, [tzSearch, allTimezones]);

  useEffect(() => {
    // Beautiful initial skeleton boot loader
    const timer = setTimeout(() => {
      setIsFirstLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateProfile({ occupation, bio, timezone });
      setLoading(false);
      setShowSavedSuccess(true);
      addToast('Profile Synchronized', 'Chrono AI updated your profile identity matrix.', 'success');
      
      // Update form pristine baseline
      initialValues.current = {
        occupation,
        bio,
        college,
        timezone,
        studyMode
      };

      setTimeout(() => {
        setShowSavedSuccess(false);
      }, 5000);
    }, 1000);
  };

  const handleSyncService = (service: string) => {
    setSyncingStates(prev => ({ ...prev, [service]: true }));
    setTimeout(() => {
      setSyncingStates(prev => ({ ...prev, [service]: false }));
      addToast('Service Synced', `Re-established secure connection stream for ${service}.`, 'success');
    }, 1500);
  };

  const executeQuickAction = (actionName: string, message: string, route?: string) => {
    addToast('Executing Request', `Triggering: ${actionName}`, 'info');
    setTimeout(() => {
      if (route) {
        navigate(route);
      } else {
        addToast('Action Succeeded', message, 'success');
      }
    }, 800);
  };

  // Sections mock databases
  const activities = [
    {
      title: "Completed project", desc: "Secured deadline for 'DeadlineZero Beta' deployment", time: "Today, 11:42 AM", icon: CheckCircle2,
      category: "Development", statusColor: "bg-emerald-500",
      details: { project: "DeadlineZero", recoveryScore: "98/100", workspace: "Frontend Production", duration: "3h 45m", device: "MacBook Pro M3", affected: "14 core user-interface modules", reasoning: "Optimal evening focus slot utilized prior to peak cognitive depletion." }
    },
    {
      title: "Finished focus sprint", desc: "Logged 50 minutes of deep focus room session", time: "Today, 9:15 AM", icon: Zap,
      category: "Focus Room", statusColor: "bg-blue-500",
      details: { project: "Core Scheduler", recoveryScore: "94/100", workspace: "Algorithms Sandbox", duration: "50 minutes", device: "Arch Linux Workstation", affected: "3 critical logic hooks", reasoning: "Bypassed typical mid-morning slump via early focus room white noise intervention." }
    },
    {
      title: "Recovered deadline", desc: "Resolved critical bottleneck for 'Sprint 4 Milestones'", time: "Yesterday, 6:30 PM", icon: Trophy,
      category: "Emergency", statusColor: "bg-amber-500",
      details: { project: "DeadlineZero Platform", recoveryScore: "99/100", workspace: "Database Schema", duration: "1h 15m", device: "GCP Console Shell", affected: "8 schema migrations and indexes", reasoning: "Panic Mode triggered at 5% time remaining, successfully stabilizing project velocity." }
    },
    {
      title: "Started Panic Mode", desc: "Engaged emergency timeline restructuring", time: "Last Week, Tuesday", icon: Flame,
      category: "Override", statusColor: "bg-rose-500",
      details: { project: "Milestone Restructure", recoveryScore: "85/100", workspace: "System Overlords", duration: "15 minutes", device: "iPad Pro Mobile", affected: "12 overdue tasks re-sequenced", reasoning: "Manual overload override requested. High risk of immediate SLA slip resolved." }
    }
  ];

  const connectedServices = [
    { name: "Google Calendar", desc: "Academic Schedule Sync", status: "Connected", icon: Calendar, color: "text-blue-400", lastSync: "2 mins ago", autoSyncStatus: "Auto (Real-time)", connectionHealth: "Excellent" },
    { name: "Google Tasks", desc: "Task Import Stream", status: "Connected", icon: CheckCircle2, color: "text-emerald-400", lastSync: "6 mins ago", autoSyncStatus: "Hourly", connectionHealth: "100%" },
    { name: "GitHub Integration", desc: "Commit & Velocity Logs", status: "Connected", icon: GitBranch, color: "text-purple-400", lastSync: "Just now", autoSyncStatus: "Real-time", connectionHealth: "Excellent" },
    { name: "Gmail Delivery", desc: "Smart Deadline Scans", status: "Connected", icon: Mail, color: "text-rose-400", lastSync: "12 mins ago", autoSyncStatus: "Hourly", connectionHealth: "Strong" },
    { name: "Notion Workspaces", desc: "Productivity Notebooks", status: "Connected", icon: FileText, color: "text-amber-400", lastSync: "15 mins ago", autoSyncStatus: "Daily", connectionHealth: "Optimized" },
    { name: "Google Drive", desc: "Artifact Backups", status: "Connected", icon: Database, color: "text-cyan-400", lastSync: "24 mins ago", autoSyncStatus: "Daily", connectionHealth: "Stable" }
  ];

  const milestones = [
    { title: "Joined DeadlineZero", desc: "Initial risk profile calibrated", date: "Jun 1, 2026" },
    { title: "First Focus Session", desc: "Completed 25-minute study study study sprint", date: "Jun 3, 2026" },
    { title: "100 Tasks Milestone", desc: "Achieved elite volume delivery", date: "Jun 12, 2026" },
    { title: "First Recovery", desc: "Overdue task rescued under Panic Mode", date: "Jun 18, 2026" },
    { title: "5 Day Streak", desc: "Active study consistency lock", date: "Jun 24, 2026" },
    { title: "Level Up: Level 8", desc: "Cognitive stamina matrix upgraded", date: "Jun 26, 2026" }
  ];

  const aiMemories = [
    {
      title: "Evening Code Affinity",
      text: "You usually finish development and coding tasks after dinner (7 PM - 10 PM).",
      confidence: 94,
      source: "Ultradian Log Parser",
      priority: "High",
      lastUpdated: "Today, 10:45 AM"
    },
    {
      title: "Notification Shielding",
      text: "You ignore external workspace notifications with 94% efficacy during active focus blocks.",
      confidence: 89,
      source: "Focal Velocity Engine",
      priority: "Medium",
      lastUpdated: "Yesterday"
    },
    {
      title: "Peak Performance Day",
      text: "Tuesday is consistently your highest task completion and focal stamina day.",
      confidence: 97,
      source: "Weekly Trend Aggregator",
      priority: "High",
      lastUpdated: "2 days ago"
    },
    {
      title: "Focus Music Efficacy",
      text: "Your deep focus retention success rises by 26% when using Focus Room white noise.",
      confidence: 91,
      source: "Focus Room Feedback Loop",
      priority: "Medium",
      lastUpdated: "Jun 24, 2026"
    }
  ];

  // Stamina stats database with dynamic trend descriptors
  const stats = [
    { label: "Tasks Completed", value: 94, trend: "+18%", trendDesc: "this week", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Focus Hours Logged", value: 42, trend: "+12%", trendDesc: "stamina up", icon: Clock, color: "text-blue-400" },
    { label: "Recovery Sprints", value: 12, trend: "+5%", trendDesc: "rescued milestones", icon: Trophy, color: "text-amber-400" },
    { label: "AI Sessions Executed", value: 18, trend: "+24%", trendDesc: "optimizations", icon: Bot, color: "text-purple-400" },
    { label: "Active Project Repos", value: 6, trend: "Stable", trendDesc: "monitored", icon: GitBranch, color: "text-cyan-400" },
    { label: "Deadlines Saved", value: 8, trend: "+100%", trendDesc: "zero slips", icon: ShieldCheck, color: "text-pink-400" }
  ];

  // Workspace Health console stats
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    overallSyncHealth: "99.8%",
    signalQuality: "Excellent",
    apiStatus: "Operational",
    averageLatency: "45",
    lastSuccessfulSync: "2 mins ago",
    pendingRequests: 0,
    nextScheduledSync: "In 4 mins",
    systemStatus: "Active / Hardened"
  });

  const handleRefreshAll = () => {
    setIsRefreshingAll(true);
    addToast('Initiating Sync Sequence', 'Recalibrating overall gateway matrices...', 'info');
    setTimeout(() => {
      setIsRefreshingAll(false);
      setDashboardMetrics({
        overallSyncHealth: "100%",
        signalQuality: "Excellent (9ms)",
        apiStatus: "Operational",
        averageLatency: "38",
        lastSuccessfulSync: "Just now",
        pendingRequests: 0,
        nextScheduledSync: "In 5 mins",
        systemStatus: "Fully Synced / Sealed"
      });
      addToast('All Workspace Streams Synced', 'Global gateway connection successfully re-established.', 'success');
    }, 1500);
  };

  if (isFirstLoading) {
    return <SkeletonScreen />;
  }

  // Framer Motion staggered transition layouts for independent columns
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

 const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <div className="relative min-h-screen select-none overflow-x-hidden pb-24">
      {/* 12. FLOATING BACKGROUNDS */}
      <FloatingBackground />
      {SHARED_STYLES}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-4 pt-4 md:pt-6" id="profile-page-root">
        
        {/* ==========================================
            HEADER SECTION
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.04] pb-6"
        >
          <div className="text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                🧠 AI OS Productivity Identity
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
              Chrono OS continuously maps your stamina factors and behavioral patterns to secure your cognitive workload blueprint.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-white/[0.05] px-4 py-2 rounded-2xl self-start shadow-md backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <motion.span
                animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-300">Identity Matrix Live</span>
          </div>
        </motion.div>

        {/* ==========================================
            MAIN CONTENT STAGGERED GRID
            ========================================== */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          
          {/* LEFT COLUMN: HERO PROFILE & RADIALS */}
          <motion.div variants={itemVariants} className="space-y-6 lg:col-span-1">
            
            {/* PROFILE HERO CARD */}
            <PremiumCard glowColor="blue" className="relative p-6 text-center flex flex-col items-center">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/15 px-2.5 py-0.5 rounded-full animate-pulse">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span className="text-[8px] font-mono font-bold text-blue-400 tracking-wider uppercase">Chrono Verified</span>
              </div>

              {/* INTERACTIVE AVATAR */}
              <div className="relative mt-5 mb-2">
                <InteractiveAvatar src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop'} />
              </div>

              <div className="mt-4 space-y-1">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                  {((user as any)?.name) || "Mahak Seth"}
                </h2>
                <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  @{((user as any)?.name || "Mahak Seth").toLowerCase().replace(/\s+/g, '')} · Member Since Jun 2026
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full mt-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="text-[10px] font-bold text-zinc-300">Rank: Top 2% Sprints</span>
                </div>
              </div>

              {/* XP PROGRESS BAR */}
              <AnimatedXPProgressBar />

              {/* STATS MATRIX */}
              <div className="w-full border-t border-white/[0.04] pt-4 mt-6 grid grid-cols-2 divide-x divide-white/[0.04]">
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Current Streak</p>
                  <p className="text-sm font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-500 animate-bounce" /> 
                    <CountUp end={5} suffix=" Days" />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Security Tier</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Hardened
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setIsShareOpen(true)}
                variant="outline" 
                size="sm" 
                className="w-full mt-4 text-[10px] gap-1 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10 hover:border-blue-500/20 text-blue-400 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share OS Passport
              </Button>
            </PremiumCard>

            {/* CHRONO COGNITIVE PROFILE */}
            <PremiumCard glowColor="purple" className="text-left">
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                  <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono">Chrono Cognitive Profile</h3>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded-md animate-pulse">
                  98% Match
                </span>
              </div>
              
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                "You're a highly focused evening learner. Your strongest productivity window is between 7 PM and 9 PM. You consistently recover missed deadlines faster than average with active Panic Room strategies."
              </p>

              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-3 border-t border-white/[0.02] mt-4">
                <span>ALIGNED COGNITION SYSTEM</span>
                <span>Updated 2 mins ago</span>
              </div>
            </PremiumCard>

            {/* PRODUCTIVITY DNA RADIALS */}
            <PremiumCard glowColor="cyan" className="space-y-4 text-left">
              <div className="border-b border-white/[0.04] pb-2">
                <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" /> Productivity DNA
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <RadialStat percent={88} label="Focus" color="#3b82f6" icon={Zap} delay={0} />
                <RadialStat percent={72} label="Planning" color="#06b6d4" icon={Calendar} delay={1} />
                <RadialStat percent={94} label="Execution" color="#10b981" icon={CheckCircle2} delay={2} />
                <RadialStat percent={91} label="Consistency" color="#8b5cf6" icon={Clock} delay={3} />
                <RadialStat percent={85} label="Recovery" color="#f43f5e" icon={Trophy} delay={4} />
                <RadialStat percent={78} label="Time Mgmt" color="#f59e0b" icon={Briefcase} delay={5} />
              </div>
            </PremiumCard>

          </motion.div>

          {/* MIDDLE COLUMN: ACCOUNT INFO & PERSONALITY */}
          <motion.div variants={itemVariants} className="space-y-6 lg:col-span-2">
            
            {/* ACCOUNT INFORMATION & FORM */}
            <PremiumCard glowColor="blue" className="p-6 text-left">
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-3.5 mb-6">
                <h3 className="font-black text-sm text-zinc-100 flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-blue-400" /> Account Identity & Parameters
                </h3>
                <div className="flex gap-1.5 bg-zinc-950/60 p-0.5 rounded-lg border border-white/[0.03]">
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer ${
                      activeTab === 'info' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/15' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('actions')}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer ${
                      activeTab === 'actions' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/15' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Safety Settings
                  </button>
                </div>
              </div>

              {activeTab === 'info' ? (
                <form onSubmit={handleProfileSave} className="space-y-5">
                  
                  {/* Dynamic Timezone Clock Dashboard */}
                  <div className="p-4 bg-zinc-950 border border-white/[0.04] rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-left shadow-inner">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Current Time</span>
                      <span className="text-xs font-black font-mono text-blue-400 tracking-tight block truncate">{tzInfo.currentTime}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Current Date</span>
                      <span className="text-[10px] font-bold text-zinc-300 truncate block">{tzInfo.currentDate}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Timezone Offset</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 block truncate">{tzInfo.offset}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Last Updated</span>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate">{lastUpdatedTime}</span>
                    </div>
                  </div>

                  {/* Profile Success banner */}
                  <AnimatePresence>
                    {showSavedSuccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                        <span className="font-bold">Profile Saved Successfully! Aligned to localized Chrono matrix.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <FloatingLabelInput
                      label="Email Address (Locked)"
                      value={user?.email || "user@example.com"}
                      disabled
                    />
                    <FloatingLabelInput
                      label="Occupation & Role"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Software Dev Engineer"
                      required
                      isSuccess={occupation.length > 3}
                    />
                    <FloatingLabelInput
                      label="College / Organization"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. University of Computer Science"
                      isSuccess={college.length > 4}
                    />
                    
                    <div className="space-y-1 mt-4 text-left">
                      <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Study / Work Mode
                      </label>
                      <select
                        value={studyMode}
                        onChange={(e) => setStudyMode(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-white/[0.05] bg-zinc-950 text-zinc-200 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-300 cursor-pointer hover:bg-zinc-900"
                      >
                        <option value="Midnight Grind">Midnight Grind (Night-Owl)</option>
                        <option value="Standard Hours">Standard Working Hours (9 AM - 5 PM)</option>
                        <option value="Continuous Focus">Continuous Sprints (Focal blocks)</option>
                      </select>
                    </div>

                    {/* Searchable Timezone Location */}
                    <div className="relative space-y-1 mt-4 text-left z-30">
                      <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Active OS Timezone Location
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-focus-within:opacity-25 blur-xs transition-opacity duration-300 pointer-events-none" />
                        <div className="relative flex items-center bg-zinc-950 border border-white/[0.05] rounded-xl group-hover:border-white/10 focus-within:border-blue-500 transition-all duration-300">
                          <Globe className="w-4 h-4 text-zinc-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={tzSearch}
                            onChange={(e) => {
                              setTzSearch(e.target.value);
                              setIsTzDropdownOpen(true);
                            }}
                            onFocus={() => setIsTzDropdownOpen(true)}
                            placeholder={timezone || "Search IANA timezone..."}
                            className="w-full px-3 py-3 bg-transparent text-xs text-zinc-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setIsTzDropdownOpen(prev => !prev)}
                            className="absolute right-3 text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer"
                          >
                            {isTzDropdownOpen ? 'Close' : 'Select'}
                          </button>
                        </div>

                        {isTzDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-zinc-950/95 border border-white/[0.08] rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.7)] z-50 divide-y divide-white/[0.02] backdrop-blur-md">
                            {filteredTimezones.length === 0 ? (
                              <div className="p-3 text-[10px] text-zinc-500 font-mono">No matching timezones</div>
                            ) : (
                              filteredTimezones.slice(0, 50).map(tz => (
                                <button
                                  key={tz}
                                  type="button"
                                  onClick={() => {
                                    setTimezone(tz);
                                    setTzSearch(tz);
                                    setIsTzDropdownOpen(false);
                                    updateProfile({ timezone: tz });
                                    addToast('Timezone Localized', `Chrono schedule adjusted to ${tz}.`, 'info');
                                  }}
                                  className={`w-full text-left p-2.5 text-[11px] font-mono hover:bg-blue-500/10 hover:text-blue-400 transition-colors cursor-pointer ${tz === timezone ? 'text-blue-400 bg-blue-500/5' : 'text-zinc-400'}`}
                                >
                                  {tz}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mt-4 text-left">
                      <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Visual Workspace Theme
                      </label>
                      <select
                        disabled
                        className="w-full text-xs p-3 rounded-xl border border-white/[0.04] bg-zinc-950 text-zinc-500 focus:outline-none cursor-not-allowed"
                      >
                        <option>Carbon Cosmic Slate (Active)</option>
                      </select>
                    </div>
                  </div>

                  <FloatingLabelTextarea
                    label="Bio Parameter (feeds AI scheduling Context)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxChar={200}
                    rows={3}
                    placeholder="Describe your background..."
                  />

                  {/* Elegant Sticky Save Button Inside the Card */}
                  <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md py-4 border-t border-white/[0.04] z-20 -mx-6 -mb-6 px-6 rounded-b-3xl mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono select-none">
                      <Globe className="w-3.5 h-3.5 text-zinc-500 animate-[spin_10s_infinite_linear]" /> Localized Matrix Aligned
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className={`gap-1.5 shadow-md border text-xs font-bold transition-all px-4 py-2 rounded-xl cursor-pointer ${
                        isDirty 
                          ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/20 text-white hover:shadow-blue-500/15' 
                          : 'bg-zinc-900 border-white/[0.02] text-zinc-500 cursor-not-allowed'
                      }`} 
                      disabled={loading || !isDirty}
                    >
                      <Save className="w-4 h-4" /> {loading ? 'Aligning Matrix...' : 'Save Profile Identity'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 pt-1">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-300">Workspace Security Coordinates</h4>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Adjust secure key access, credentials, and configure automated notification channels managed by the Chrono Engine.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4 bg-zinc-950/40 border-white/[0.03] space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-400" />
                        <span className="text-[11px] font-bold text-zinc-200">Credential Tokens</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-light leading-relaxed">Change password parameters to update master database authentications.</p>
                      <Button 
                        onClick={() => executeQuickAction('Change Password', 'Password synchronization framework initiated.')}
                        variant="outline" size="sm" className="w-full text-[10px] cursor-pointer"
                      >
                        Change Password
                      </Button>
                    </Card>

                    <Card className="p-4 bg-zinc-950/40 border-white/[0.03] space-y-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span className="text-[11px] font-bold text-zinc-200">OAuth Credentials</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-light leading-relaxed">Direct workspace access authorization with external APIs.</p>
                      <Button 
                        onClick={() => executeQuickAction('OAuth Update', 'Authentications checked and authorized.')}
                        variant="outline" size="sm" className="w-full text-[10px] cursor-pointer"
                      >
                        Manage Authorized Keys
                      </Button>
                    </Card>
                  </div>
                </div>
              )}
            </PremiumCard>

            {/* CHRONO PERSONALITY DIAGNOSTICS */}
            <PremiumCard glowColor="purple" className="text-left">
              <div className="border-b border-white/[0.04] pb-3 mb-4">
                <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-400" /> Chrono Personality Diagnostics
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Peak Productivity", value: "Evening Window", desc: "7 PM - 10 PM Focus", color: "text-blue-400 bg-blue-500/5 hover:border-blue-500/20" },
                  { label: "Preferred Sprint", value: "50 Minutes", desc: "Ultradian Rhythm Aligned", color: "text-cyan-400 bg-cyan-500/5 hover:border-cyan-500/20" },
                  { label: "Preferred Break", value: "10 Minutes", desc: "Optimal Active Recovery", color: "text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/20" },
                  { label: "Risk Behavior", value: "Moderate Risk", desc: "Flexible timeline buffer", color: "text-amber-400 bg-amber-500/5 hover:border-amber-500/20" },
                  { label: "Work Style", value: "Deep Focus", desc: "Sprints with zero clutter", color: "text-purple-400 bg-purple-500/5 hover:border-purple-500/20" },
                  { label: "Learning Style", value: "Visual Log", desc: "Milestone-driven map", color: "text-pink-400 bg-pink-500/5 hover:border-pink-500/20" }
                ].map((p, idx) => (
                  <div key={idx} className={`p-3 border border-white/[0.03] rounded-2xl flex flex-col justify-between transition-all duration-300 ${p.color}`}>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{p.label}</span>
                    <div className="mt-1.5">
                      <span className="text-xs font-black text-zinc-100">{p.value}</span>
                      <p className="text-[9px] text-zinc-400 font-light mt-0.5 leading-snug">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>

            {/* STATISTICS GRID WITH TREND CHIPS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              {stats.map((stat, idx) => (
                <PremiumCard key={idx} glowColor="cyan" className="p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</span>
                    <stat.icon className={`w-4 h-4 ${stat.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`} />
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <h4 className="text-2xl font-black text-white tracking-tight">
                      <CountUp end={stat.value} />
                    </h4>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        {stat.trend}
                      </span>
                      <span className="text-[8px] text-zinc-600 font-mono mt-0.5 select-none">{stat.trendDesc}</span>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>

          </motion.div>

        </motion.div>

        {/* ==========================================
            MIDDLE-BOTTOM SECTION: CONSOLE & DATA STREAMS
            ========================================== */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6 text-left"
        >
          {/* WORKSPACE HEALTH CONSOLE */}
          <WorkspaceHealthDashboard 
            overallSyncHealth={dashboardMetrics.overallSyncHealth}
            signalQuality={dashboardMetrics.signalQuality}
            apiStatus={dashboardMetrics.apiStatus}
            averageLatency={dashboardMetrics.averageLatency}
            lastSuccessfulSync={dashboardMetrics.lastSuccessfulSync}
            pendingRequests={dashboardMetrics.pendingRequests}
            nextScheduledSync={dashboardMetrics.nextScheduledSync}
            systemStatus={dashboardMetrics.systemStatus}
            onRefreshAll={handleRefreshAll}
            isRefreshingAll={isRefreshingAll}
          />

          {/* SIMPLIFIED CONNECTED WORKSPACE STREAMS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedServices.map((service, idx) => (
              <ConnectedServiceCard 
                key={idx} 
                {...service} 
                onSync={handleSyncService}
                isSyncing={syncingStates[service.name] || false}
              />
            ))}
          </div>

          {/* STRATEGIC MEMORIES WITH PROGRESS BARS */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider text-left pl-1">
              Chrono Strategic Memory Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {aiMemories.map((memo, idx) => (
                <MemoryRegisterCard key={idx} memory={memo} index={idx} />
              ))}
            </div>
          </div>

          {/* MILESTONE ACHIEVEMENT UNLOCKS */}
          <PremiumCard glowColor="blue" className="text-left">
            <div className="border-b border-white/[0.04] pb-3 mb-4 flex justify-between items-center">
              <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400 animate-pulse" /> Milestone Achievement Unlocks
              </h3>
              <span className="text-[9px] font-mono text-amber-400 font-bold">6 / 6 Unlocked</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Flame, title: "5 Day Streak", desc: "Active focus continuity lock", color: "text-amber-400 border-amber-500/10 hover:border-amber-500/25 bg-amber-500/5", glowClass: "bg-amber-500" },
                { icon: Zap, title: "Focus Master", desc: "Completed 15+ focus sessions", color: "text-cyan-400 border-cyan-500/10 hover:border-cyan-500/25 bg-cyan-500/5", glowClass: "bg-cyan-500" },
                { icon: CheckCircle2, title: "100 Tasks Completed", desc: "High-volume delivery mastery", color: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/25 bg-emerald-500/5", glowClass: "bg-emerald-500" },
                { icon: Trophy, title: "Sprint Champion", desc: "Weekly target challenges aced", color: "text-indigo-400 border-indigo-500/10 hover:border-indigo-500/25 bg-indigo-500/5", glowClass: "bg-indigo-500" },
                { icon: ShieldCheck, title: "Recovery Expert", desc: "Rescued from high danger margins", color: "text-rose-400 border-rose-500/10 hover:border-rose-500/25 bg-rose-500/5", glowClass: "bg-rose-500" },
                { icon: Bot, title: "Deep Worker", desc: "Logged 40+ deep focus hours", color: "text-pink-400 border-pink-500/10 hover:border-pink-500/25 bg-pink-500/5", glowClass: "bg-pink-500" }
              ].map((badge, idx) => (
                <AchievementBadge key={idx} {...badge} />
              ))}
            </div>
          </PremiumCard>

        </motion.div>

        {/* ==========================================
            BOTTOM ROW: ACTIVE FEED & JOURNEY MAP
            ========================================== */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          
          {/* ACTIVE WORKSPACE TIMELINE FEED */}
          <PremiumCard glowColor="blue" className="text-left relative">
            <div className="border-b border-white/[0.04] pb-3 mb-4">
              <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" /> Active Workspace Feed (Expandable)
              </h3>
            </div>

            <div className="relative pl-4 ml-2 space-y-5">
              <TimelineLine />
              {activities.map((act, idx) => (
                <TimelineItem key={idx} {...act} index={idx} />
              ))}
            </div>
          </PremiumCard>

          {/* ALIGNED JOURNEY MILESTONES */}
          <PremiumCard glowColor="cyan" className="text-left relative">
            <div className="border-b border-white/[0.04] pb-3 mb-4">
              <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} /> Aligned Journey Milestones
              </h3>
            </div>

            <div className="relative pl-4 ml-2 space-y-5">
              <TimelineLine />
              {milestones.map((m, idx) => (
                <div key={idx} className="relative group/milestone">
                  <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-zinc-950 border-2 border-cyan-400 hover:scale-110 transition-transform" />
                  <div className="space-y-0.5 text-left pl-1 group-hover/milestone:translate-x-1 transition-transform">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200">{m.title}</span>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold">{m.date}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-light">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* IDENTITY QUICK ACTIONS */}
          <PremiumCard glowColor="purple" className="flex flex-col justify-between text-left h-full">
            <div>
              <div className="border-b border-white/[0.04] pb-3 mb-4">
                <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-400" /> Identity Quick Actions
                </h3>
              </div>
              
              <p className="text-xs text-zinc-400 font-light leading-relaxed mb-6">
                Launch rapid system updates, backup your persistent configuration state, or export structured analytical metadata logs.
              </p>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={() => executeQuickAction('Edit Identity', 'Switched focus target back to active forms.', '/profile')}
                variant="outline"
                className="w-full text-xs justify-between group hover:border-blue-500/20 hover:text-blue-400 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Edit Profile Identity
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => executeQuickAction('Launch Focus Room', 'Transferring active session context to Focus Room...', '/focus-room')}
                variant="outline"
                className="w-full text-xs justify-between group hover:border-cyan-500/20 hover:text-cyan-400 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4" /> Launch Focus Room
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => executeQuickAction('Generate Report', 'Chrono AI compiled a 7-day performance ledger.')}
                variant="outline"
                className="w-full text-xs justify-between group hover:border-emerald-500/20 hover:text-emerald-400 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" /> Generate Weekly Report
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => executeQuickAction('Export Analytics', 'Structured JSON analytics telemetry successfully copied.')}
                variant="outline"
                className="w-full text-xs justify-between group hover:border-pink-500/20 hover:text-pink-400 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Export Analytics Ledger
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => executeQuickAction('Backup Workspace', 'Synchronized local state to encrypted cloud backup.')}
                className="w-full text-xs justify-between bg-zinc-950 border border-white/[0.04] text-zinc-300 hover:text-white hover:border-blue-500/10 hover:bg-zinc-900 group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4" /> Backup Workspace
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </PremiumCard>

        </motion.div>

        {/* 11. UPGRADED FLOATING AI STATUS PILL */}
        <FloatingAIStatus />

        {/* PROFILE EXPORT MODAL DIALOG */}
        <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      </div>
    </div>
  );
};
