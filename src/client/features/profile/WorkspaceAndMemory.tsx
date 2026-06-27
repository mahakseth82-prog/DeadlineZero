import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Sparkles, Cpu, RefreshCw, Activity } from 'lucide-react';
import { CountUp } from './ProfileComponents';

// --------------------------------------------------
// ACHIEVEMENT BADGE COMPONENT WITH REFLECTIONS
// --------------------------------------------------
interface AchievementProps {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  color: string;
  glowClass: string;
}

export const AchievementBadge: React.FC<AchievementProps> = ({ icon: Icon, title, desc, color, glowClass }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    if (isInView) {
      setShowSparks(true);
      const timer = setTimeout(() => setShowSparks(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ 
        y: -6, 
        scale: 1.03, 
        boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px -3px rgba(234,179,8,0.15)`
      }}
      className={`relative p-4 border rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${color} group h-full`}
    >
      <div className={`absolute -inset-1 rounded-2xl opacity-10 blur-lg transition-opacity duration-300 group-hover:opacity-20 ${glowClass}`} />
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:animate-[shimmer-sweep_1.5s_ease-out_1]" />

      {showSparks && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute text-[8px] animate-float-sparkle" style={{ left: '15%', top: '25%' }}>✨</span>
          <span className="absolute text-[6px] animate-float-sparkle" style={{ left: '80%', top: '20%', animationDelay: '0.4s' }}>⚡</span>
          <span className="absolute text-[8px] animate-float-sparkle" style={{ left: '45%', top: '70%', animationDelay: '0.2s' }}>💎</span>
        </div>
      )}

      <div className="flex items-center gap-2.5 relative z-10">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.08] transition-colors shadow-inner flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 animate-[pulse_2s_infinite]" />
        </div>
        <div className="text-left">
          <span className="text-xs font-black text-zinc-100 block tracking-tight">{title}</span>
          <span className="text-[8px] font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider">UNLOCKED</span>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-400 font-light mt-3 leading-relaxed relative z-10">{desc}</p>
      
      <Sparkles className="absolute top-3.5 right-3.5 w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors duration-300" />
    </motion.div>
  );
};

// --------------------------------------------------
// AI MEMORY REGISTER CARD WITH SCAN ANIMATION
// --------------------------------------------------
interface StructuredMemory {
  title: string;
  text: string;
  confidence: number;
  source: string;
  priority: string;
  lastUpdated: string;
}

export const MemoryRegisterCard: React.FC<{ memory: StructuredMemory; index: number }> = ({ memory, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const priorityColors: Record<string, string> = {
    High: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Low: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, border: "1px solid rgba(59, 130, 246, 0.25)" }}
      className="relative p-5 bg-zinc-950/45 border border-white/[0.04] rounded-2xl overflow-hidden hover:shadow-[0_12px_30px_rgba(59,130,246,0.06)] transition-all duration-300 text-left group"
    >
      {/* Animated Scanning Line */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent top-0 animate-[scan-line_4s_infinite_linear]" style={{ animationDelay: `${index * 0.5}s` }} />

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">{memory.title}</h4>
            <p className="text-[9px] font-mono text-zinc-500">Source: {memory.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${priorityColors[memory.priority] || "text-zinc-400 border-zinc-700 bg-zinc-800"}`}>
            {memory.priority}
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
            Conf {memory.confidence}%
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-light min-h-[44px] border-b border-white/[0.03] pb-3 mb-3">
        "{memory.text}"
      </p>

      <div className="space-y-2 text-[9px] font-mono text-zinc-500">
        <div className="flex justify-between items-center">
          <span>AI Confidence Meter:</span>
          <span className="text-zinc-300 font-bold">{memory.confidence}%</span>
        </div>
        
        <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: `${memory.confidence}%` } : { width: 0 }}
            transition={{ duration: 1.2, delay: index * 0.1 }}
          />
        </div>
        <div className="flex justify-between pt-1 text-[8px] text-zinc-600">
          <span>ID: ID-MEM-00{index + 1}</span>
          <span>Last Updated: {memory.lastUpdated}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --------------------------------------------------
// CONNECTED SERVICES COMPONENT
// --------------------------------------------------
export interface ServiceProps {
  name: string;
  desc: string;
  status: string; // "Connected" / "Disconnected"
  icon: React.ComponentType<any>;
  color: string;
  lastSync: string;
  autoSyncStatus: string;
  connectionHealth: string;
  onSync: (name: string) => void;
  isSyncing: boolean;
}

export const ConnectedServiceCard: React.FC<ServiceProps> = ({ 
  name, desc, status, icon: Icon, color, lastSync, autoSyncStatus, connectionHealth, onSync, isSyncing 
}) => {
  return (
    <div className="relative p-5 bg-zinc-950/45 border border-white/[0.04] rounded-2xl flex flex-col justify-between group overflow-hidden hover:border-white/12 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.05] group-hover:scale-105 transition-all duration-300 shadow-inner">
            <Icon className={`w-5 h-5 ${color} transition-transform duration-500 group-hover:rotate-12`} />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              {name}
              {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-400" />}
            </h4>
            <span className="text-[10px] font-mono text-zinc-500 block leading-tight mt-0.5">{desc}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/[0.03] text-[9px] font-mono text-zinc-500 text-left">
        <div>
          <span className="text-zinc-600 block uppercase text-[8px] tracking-wider">Last Sync:</span>
          <span className="text-zinc-300 font-bold">{isSyncing ? "Syncing..." : lastSync}</span>
        </div>
        <div>
          <span className="text-zinc-600 block uppercase text-[8px] tracking-wider">Auto Sync:</span>
          <span className="text-zinc-300 font-bold">{autoSyncStatus}</span>
        </div>
        <div className="mt-1 col-span-2 flex justify-between items-center">
          <div>
            <span className="text-zinc-600 inline uppercase text-[8px] tracking-wider mr-1">Health:</span>
            <span className="text-cyan-400 font-bold">{connectionHealth}</span>
          </div>
          <button
            onClick={() => onSync(name)}
            disabled={isSyncing}
            className="text-blue-400 hover:text-blue-300 font-black flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : 'hover:rotate-12 transition-transform'}`} />
            {isSyncing ? 'Reconnecting...' : 'Reconnect'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// WORKSPACE HEALTH DASHBOARD COMPONENT
// --------------------------------------------------
interface WorkspaceHealthDashboardProps {
  overallSyncHealth: string;
  signalQuality: string;
  apiStatus: string;
  averageLatency: string;
  lastSuccessfulSync: string;
  pendingRequests: number;
  nextScheduledSync: string;
  systemStatus: string;
  onRefreshAll: () => void;
  isRefreshingAll: boolean;
}

export const WorkspaceHealthDashboard: React.FC<WorkspaceHealthDashboardProps> = ({
  overallSyncHealth,
  signalQuality,
  apiStatus,
  averageLatency,
  lastSuccessfulSync,
  pendingRequests,
  nextScheduledSync,
  systemStatus,
  onRefreshAll,
  isRefreshingAll
}) => {
  return (
    <div className="relative p-6 bg-zinc-950/45 border border-white/[0.04] rounded-3xl overflow-hidden text-left hover:border-white/10 transition-all duration-300 shadow-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-4 mb-5">
        <div>
          <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Active Stream Control</p>
          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Workspace Health console
          </h3>
        </div>
        <button
          onClick={onRefreshAll}
          disabled={isRefreshingAll}
          className="text-[10px] font-mono font-bold uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/25 px-3 py-1.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
          {isRefreshingAll ? 'Refreshing All...' : 'Refresh Streams'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-3.5 bg-white/[0.01] border border-white/[0.02] rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Overall Sync Health</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-white tracking-tight">{overallSyncHealth}</span>
            <span className="text-[8px] text-emerald-400 font-mono">Optimal</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: overallSyncHealth }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 bg-white/[0.01] border border-white/[0.02] rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Signal Quality</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-zinc-100 tracking-tight">{signalQuality}</span>
          </div>
          <span className="text-[8px] font-mono text-cyan-400 mt-2">No packet loss detected</span>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 bg-white/[0.01] border border-white/[0.02] rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">API Gateways</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase">{apiStatus}</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-500 mt-2">All servers pinging active</span>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 bg-white/[0.01] border border-white/[0.02] rounded-2xl flex flex-col justify-between">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Average Latency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-zinc-100 tracking-tight">{averageLatency}</span>
            <span className="text-[8px] text-zinc-500 font-mono">ms</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-500 mt-2">Ultra-low jitter</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 border-t border-white/[0.03] pt-4 text-[10px] font-mono text-zinc-500">
        <div>
          <span className="text-zinc-600 block text-[8px] uppercase tracking-wider">Last Full Sync:</span>
          <span className="text-zinc-200 font-bold">{lastSuccessfulSync}</span>
        </div>
        <div>
          <span className="text-zinc-600 block text-[8px] uppercase tracking-wider">Pending Requests:</span>
          <span className="text-zinc-200 font-bold">{pendingRequests}</span>
        </div>
        <div>
          <span className="text-zinc-600 block text-[8px] uppercase tracking-wider">Next Scheduled Sync:</span>
          <span className="text-zinc-300 font-bold text-cyan-400 animate-pulse">{nextScheduledSync}</span>
        </div>
        <div>
          <span className="text-zinc-600 block text-[8px] uppercase tracking-wider">Chrono OS Shield:</span>
          <span className="text-emerald-400 font-bold">{systemStatus}</span>
        </div>
      </div>
    </div>
  );
};

