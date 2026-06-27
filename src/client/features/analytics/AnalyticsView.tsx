/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Activity,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Compass,
  Cpu,
  Brain,
  Award,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Timer,
  ChevronRight,
  Sparkle,
  Lightbulb,
  Workflow,
  Check
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useTaskStore } from '../../store/task.store';
import { useFocusStore } from '../../store/focus.store';
import { usePanicStore } from '../../store/panic.store';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { TaskStatus } from '../../../types';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 13. MICRO ANIMATIONS: Animated Number Helper
// ==========================================
const AnimatedNumber: React.FC<{ value: number; suffix?: string; prefix?: string; duration?: number }> = ({ 
  value, 
  suffix = "", 
  prefix = "",
  duration = 1000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeProgress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

// ==========================================
// 2. KPI OVERVIEW: Sparkline Mini SVG
// ==========================================
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#3b82f6" }) => {
  const points = useMemo(() => {
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const y = 30 - ((val - min) / range) * 24 - 3;
      return `${x},${y}`;
    }).join(' ');
  }, [data]);

  return (
    <svg className="w-16 h-8 overflow-visible opacity-80" viewBox="0 0 100 30">
      <defs>
        <linearGradient id={`sparkline-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0,30 L ${points} L 100,30 Z`}
        fill={`url(#sparkline-grad-${color})`}
      />
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </svg>
  );
};

// ==========================================
// 4. PRODUCTIVITY HEATMAP
// ==========================================
interface HeatmapCell {
  date: string;
  hours: number;
  tasks: number;
  recovery: number;
}

const ProductivityHeatmap: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(() => {
    const list: HeatmapCell[] = [];
    const baseDate = new Date();
    // 22 weeks * 7 days = 154 cells
    for (let i = 153; i >= 0; i--) {
      const d = new Date();
      d.setDate(baseDate.getDate() - i);
      const day = d.getDay();
      
      const multiplier = day === 2 || day === 4 ? 1.6 : day === 0 || day === 6 ? 0.3 : 1.0;
      const wave = Math.sin(i / 14) * 0.35 + 0.65;
      const noise = Math.random() * 0.3 + 0.1;
      
      const hours = Math.min(8.5, Math.max(0, parseFloat((multiplier * wave * 5.0 + noise * 1.5).toFixed(1))));
      const tasks = hours === 0 ? 0 : Math.round(hours * 0.8 + Math.random());
      const recovery = hours === 0 ? 98 : Math.min(100, Math.round(75 + hours * 2.8 + Math.random() * 5));

      list.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hours: hours < 1 && Math.random() > 0.4 ? 0 : hours,
        tasks,
        recovery
      });
    }
    return list;
  }, []);

  const columns = useMemo(() => {
    const cols: HeatmapCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      cols.push(cells.slice(i, i + 7));
    }
    return cols;
  }, [cells]);

  const handleCellMove = (e: React.MouseEvent, cell: HeatmapCell) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 100
      });
      setHoveredCell(cell);
    }
  };

  return (
    <div ref={containerRef} className="relative space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Weekly Performance Map</span>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
          <span>Low</span>
          <div className="w-2.5 h-2.5 bg-zinc-900 border border-white/[0.02] rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-950/40 border border-white/[0.02] rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-900/60 border border-white/[0.02] rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-700/80 border border-white/[0.02] rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-500 border border-white/[0.02] rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span>High</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-1 min-w-[340px]">
          <div className="grid grid-rows-7 text-[9px] font-mono text-zinc-500 h-[88px] pr-1.5 select-none justify-items-end items-center leading-none">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {columns.map((col, colIdx) => (
            <div key={colIdx} className="grid grid-rows-7 gap-1 h-[88px]">
              {col.map((cell, cellIdx) => {
                let colorClass = "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/[0.02]";
                let shadowStyle = "";
                
                if (cell.hours > 6.5) {
                  colorClass = "bg-blue-500 border-blue-400/20";
                  shadowStyle = "shadow-[0_0_8px_rgba(59,130,246,0.4)]";
                } else if (cell.hours > 4.5) {
                  colorClass = "bg-blue-700 border-blue-600/10";
                } else if (cell.hours > 2) {
                  colorClass = "bg-blue-900/70 border-blue-900/10";
                } else if (cell.hours > 0) {
                  colorClass = "bg-blue-950/45 border-blue-950/10";
                }

                return (
                  <motion.div
                    key={cellIdx}
                    className={`w-2.5 h-2.5 rounded-sm border cursor-crosshair transition-all duration-150 ${colorClass} ${shadowStyle}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: (colIdx * 7 + cellIdx) * 0.002 }}
                    onMouseEnter={(e) => handleCellMove(e, cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseMove={(e) => handleCellMove(e, cell)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.1 }}
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
            className="absolute z-50 w-44 p-2.5 bg-zinc-950/95 border border-white/[0.08] rounded-xl shadow-2xl backdrop-blur-md pointer-events-none text-left space-y-1"
          >
            <div className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
              {hoveredCell.date}
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Focus Hours:</span>
                <span className="font-mono font-bold text-blue-400">{hoveredCell.hours} hrs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Tasks Completed:</span>
                <span className="font-mono font-bold text-emerald-400">{hoveredCell.tasks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Recovery Index:</span>
                <span className="font-mono font-bold text-cyan-400">{hoveredCell.recovery}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 5. TASK DISTRIBUTION: Donut Chart
// ==========================================
interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

const DONUT_SEGMENTS: DonutSegment[] = [
  { name: 'Completed', value: 45, color: '#3b82f6' },
  { name: 'In Progress', value: 30, color: '#06b6d4' },
  { name: 'Delayed', value: 15, color: '#f59e0b' },
  { name: 'Recovered', value: 10, color: '#10b981' }
];

const TaskDonutChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const circumference = 2 * Math.PI * 60;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />
          {DONUT_SEGMENTS.map((seg, i) => {
            const strokeLength = (seg.value / 100) * circumference;
            const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
            accumulatedPercent += seg.value;
            const isHovered = hoveredIdx === i;

            return (
              <motion.circle
                key={i}
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? 14 : 10}
                strokeDasharray={`${strokeLength} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ 
                  strokeDashoffset: strokeOffset,
                  strokeWidth: isHovered ? 14 : 10
                }}
                transition={{ strokeDashoffset: { type: "spring", stiffness: 40, damping: 12, delay: i * 0.1 } }}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
            {hoveredIdx !== null ? DONUT_SEGMENTS[hoveredIdx].name : 'Sprints'}
          </span>
          <span className="text-xl font-black text-white mt-0.5">
            {hoveredIdx !== null ? `${DONUT_SEGMENTS[hoveredIdx].value}%` : '124'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 text-left">
        {DONUT_SEGMENTS.map((seg, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all duration-150 cursor-pointer ${
                isHovered ? 'bg-white/[0.03]' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <div>
                <p className="text-xs font-semibold text-zinc-200">{seg.name}</p>
                <p className="text-[9px] font-mono text-zinc-500">{seg.value}% Proportion</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 8. GOAL PROGRESS: Circular Progress Rings
// ==========================================
const CircularProgress: React.FC<{ 
  percent: number; 
  title: string; 
  subtitle: string; 
  color: string; 
  icon: React.ComponentType<any> 
}> = ({ percent, title, subtitle, color, icon: Icon }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="flex items-center gap-4 bg-zinc-900/30 border-white/[0.04] p-4 hover:border-blue-500/10 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
      <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="5" />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <div className="text-left space-y-0.5">
        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{subtitle}</span>
        <h4 className="text-xs font-bold text-white leading-tight">{title}</h4>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono text-zinc-300 font-bold">{percent}% Target Hit</span>
        </div>
      </div>
    </Card>
  );
};

// ==========================================
// 3. PRODUCTIVITY TIMELINE
// ==========================================
interface ChartPoint {
  label: string;
  focus: number;
  tasks: number;
}

const TIMELINE_DATASETS: Record<'daily' | 'weekly' | 'monthly', ChartPoint[]> = {
  daily: [
    { label: 'Mon', focus: 4.5, tasks: 5 },
    { label: 'Tue', focus: 6.2, tasks: 8 },
    { label: 'Wed', focus: 3.0, tasks: 4 },
    { label: 'Thu', focus: 5.5, tasks: 6 },
    { label: 'Fri', focus: 7.2, tasks: 9 },
    { label: 'Sat', focus: 2.5, tasks: 3 },
    { label: 'Sun', focus: 1.8, tasks: 2 }
  ],
  weekly: [
    { label: 'Wk 19', focus: 22.0, tasks: 25 },
    { label: 'Wk 20', focus: 28.0, tasks: 32 },
    { label: 'Wk 21', focus: 31.0, tasks: 35 },
    { label: 'Wk 22', focus: 26.0, tasks: 28 },
    { label: 'Wk 23', focus: 35.0, tasks: 41 },
    { label: 'Wk 24', focus: 42.5, tasks: 47 }
  ],
  monthly: [
    { label: 'Jan', focus: 85.0, tasks: 98 },
    { label: 'Feb', focus: 92.0, tasks: 112 },
    { label: 'Mar', focus: 110.0, tasks: 134 },
    { label: 'Apr', focus: 105.0, tasks: 120 },
    { label: 'May', focus: 130.0, tasks: 150 },
    { label: 'Jun', focus: 145.0, tasks: 172 }
  ]
};

const TimelineChart: React.FC = () => {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const dataset = TIMELINE_DATASETS[tab];
  const maxVal = useMemo(() => {
    return Math.max(...dataset.map(d => d.focus)) * 1.15 || 10;
  }, [dataset]);

  // SVG Geometry Constants
  const width = 800;
  const height = 260;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = useMemo(() => {
    const len = dataset.length;
    return dataset.map((d, i) => {
      const x = paddingLeft + (i / (len - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.focus / maxVal) * chartHeight;
      return { x, y, data: d };
    });
  }, [dataset, chartWidth, chartHeight, maxVal]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`;
  }, [linePath, points, chartHeight]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convert physical mouse position to SVG view coordinates
    const scaleX = width / rect.width;
    const svgMouseX = mouseX * scaleX;
    
    const relativeX = svgMouseX - paddingLeft;
    const pct = relativeX / chartWidth;
    
    let idx = Math.round(pct * (dataset.length - 1));
    idx = Math.max(0, Math.min(dataset.length - 1, idx));
    
    setActiveIdx(idx);
    
    // Position tooltip in HTML layout
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 80
    });
  };

  return (
    <Card className="lg:col-span-2 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" /> Executive Timeline
        </h3>
        <div className="flex bg-zinc-950/60 p-0.5 rounded-lg border border-white/[0.04] self-start">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setActiveIdx(null); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition-all duration-200 cursor-pointer ${
                tab === t 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' 
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-auto overflow-visible select-none cursor-crosshair"
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveIdx(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = paddingTop + chartHeight * p;
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* X Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 12}
              fill="rgba(255,255,255,0.25)"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {p.data.label}
            </text>
          ))}

          {/* Gradient fill */}
          <motion.path
            d={areaPath}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Core line curve */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] }}
          />

          {/* Data vertex dots */}
          {points.map((p, idx) => {
            const isActive = activeIdx === idx;
            return (
              <g key={idx}>
                {isActive && (
                  <circle cx={p.x} cy={p.y} r="10" fill="#3b82f6" opacity="0.15" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? "5" : "3.5"}
                  fill={isActive ? "#3b82f6" : "#1f2937"}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip details */}
        <AnimatePresence>
          {activeIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
              className="absolute z-40 w-44 p-3 bg-zinc-950/95 border border-white/[0.08] rounded-xl shadow-2xl backdrop-blur-md pointer-events-none text-left space-y-1.5"
            >
              <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider border-b border-white/[0.03] pb-1">
                Interval: {dataset[activeIdx].label}
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Focus Target:</span>
                  <span className="font-mono font-bold text-blue-400">{dataset[activeIdx].focus} hrs</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Tasks Saved:</span>
                  <span className="font-mono font-bold text-emerald-400">{dataset[activeIdx].tasks} completed</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

// ==========================================
// 6. AI PERFORMANCE INSIGHTS
// ==========================================
interface InsightItem {
  title: string;
  desc: string;
  confidence: string;
  time: string;
  accent: string;
  icon: React.ComponentType<any>;
}

const INSIGHTS_DATA: InsightItem[] = [
  {
    title: "Peak Productivity Window",
    desc: "You complete development tasks 24% faster after 7 PM.",
    confidence: "96%",
    time: "2 mins ago",
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    icon: Brain
  },
  {
    title: "Best Working Day",
    desc: "Tuesday consistently has the highest task completion and focal stamina.",
    confidence: "92%",
    time: "5 mins ago",
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    icon: Calendar
  },
  {
    title: "Cognitive Fatigue Drop",
    desc: "Stamina and delivery rate decreases after 3 hours of continuous focus.",
    confidence: "88%",
    time: "12 mins ago",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Zap
  },
  {
    title: "Strategic Recommendation",
    desc: "Schedule highly complex tasks during your peak 7 PM - 9 PM window.",
    confidence: "95%",
    time: "15 mins ago",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Target
  }
];

// ==========================================
// 7. WEEKLY COMPARISON
// ==========================================
interface CompItem {
  name: string;
  lastVal: string;
  thisVal: string;
  change: string;
  isPositive: boolean;
}

const COMPARISON_DATA: CompItem[] = [
  { name: 'Focus Hours', lastVal: '36.8h', thisVal: '42.5h', change: '+15.4%', isPositive: true },
  { name: 'Tasks Complete', lastVal: '87', thisVal: '94', change: '+8.0%', isPositive: true },
  { name: 'Recovery Score', lastVal: '82%', thisVal: '91%', change: '+10.9%', isPositive: true },
  { name: 'Stress Index', lastVal: '64%', thisVal: '48%', change: '-25.0%', isPositive: true }, // less stress is positive!
  { name: 'Deep Work blocks', lastVal: '14', thisVal: '18', change: '+28.5%', isPositive: true },
  { name: 'Planning Accuracy', lastVal: '78%', thisVal: '85%', change: '+8.9%', isPositive: true }
];

// ==========================================
// 10. PRODUCTIVITY BREAKDOWN
// ==========================================
interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

const BREAKDOWN_DATA: BreakdownItem[] = [
  { name: 'Focus Stamina', value: 88, color: 'bg-blue-500' },
  { name: 'Planning Accuracy', value: 72, color: 'bg-cyan-500' },
  { name: 'Execution Velocity', value: 94, color: 'bg-emerald-500' },
  { name: 'Consistency Index', value: 91, color: 'bg-indigo-500' },
  { name: 'Active Recovery', value: 85, color: 'bg-pink-500' },
  { name: 'Time Stewardship', value: 78, color: 'bg-amber-500' }
];

// ==========================================
// 11. ACHIEVEMENTS
// ==========================================
interface BadgeItem {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  color: string;
}

const BADGES_DATA: BadgeItem[] = [
  { icon: Flame, title: "5 Day Streak", desc: "Maintained active study streak", color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
  { icon: Zap, title: "Focus Master", desc: "Completed 15+ focus sessions", color: "text-cyan-400 bg-cyan-500/5 border-cyan-500/10" },
  { icon: Target, title: "100 Tasks Completed", desc: "High-volume delivery mastery", color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
  { icon: Award, title: "Recovery Expert", desc: "Resolved all critical delays", color: "text-rose-400 bg-rose-500/5 border-rose-500/10" },
  { icon: ShieldCheck, title: "Deep Worker", desc: "Logged 40+ deep focus hours", color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10" }
];

// ==========================================
// MAIN ANALYTICS VIEW
// ==========================================
export const AnalyticsView: React.FC = () => {
  const { tasks } = useTaskStore();
  const { completedSessions } = useFocusStore();
  const { completedPanics } = usePanicStore();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [recStates, setRecStates] = useState<Record<number, 'idle' | 'running' | 'success'>>({});

  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 88;

  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  const activeStreak = user?.currentStreak || 5;
  const panicRecoveriesCount = completedPanics.length;

  const handleRecommendationAction = (index: number, actionName: string, path?: string) => {
    if (path) {
      setRecStates(prev => ({ ...prev, [index]: 'running' }));
      setTimeout(() => {
        setRecStates(prev => ({ ...prev, [index]: 'success' }));
        navigate(path);
      }, 800);
      return;
    }

    setRecStates(prev => ({ ...prev, [index]: 'running' }));
    setTimeout(() => {
      setRecStates(prev => ({ ...prev, [index]: 'success' }));
      addToast(
        "Chrono AI Triggered",
        `Successfully executed: ${actionName}`,
        'success'
      );
      // reset state back to idle after a delay
      setTimeout(() => {
        setRecStates(prev => ({ ...prev, [index]: 'idle' }));
      }, 2500);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
      id="analytics-page-root"
    >
      
      {/* ==========================================
          1. HERO SECTION & HEADER
          ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.04] pb-6">
        <div className="text-left space-y-1.5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light">
            Monitor your productivity trend, completed sessions, and focus metrics.
          </p>
        </div>

        {/* Slow breathing pulse indicator */}
        <div className="flex items-center gap-2 bg-zinc-900/40 border border-white/[0.04] px-4 py-2 rounded-2xl self-start shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-zinc-300">Analytics Updated</span>
        </div>
      </div>

      {/* ==========================================
          2. LIVE SUMMARY CARDS (HERO SUMMARY)
          ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tasks Completed", value: completedCount, suffix: ` / ${totalTasksCount}`, trend: "Total tasks", color: "text-blue-400" },
          { label: "Completion Rate", value: completionRate, suffix: "%", trend: "Successful outcomes", color: "text-emerald-400" },
          { label: "Focus Time", value: parseFloat(focusHours), suffix: " hrs", trend: "Total hours logged", color: "text-cyan-400" },
          { label: "Current Streak", value: activeStreak, suffix: " Days", trend: "Streak Active", color: "text-pink-400" }
        ].map((item, idx) => (
          <Card key={idx} className="relative overflow-hidden bg-zinc-900/30 border-white/[0.04] p-5 text-left group hover:border-white/[0.08] transition-all">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-bl-full pointer-events-none group-hover:bg-white/[0.02] transition-colors" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">{item.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${item.color}`}>
                <AnimatedNumber value={item.value} suffix={item.suffix} />
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-zinc-400">
              <span className="w-1 h-1 bg-zinc-500 rounded-full" />
              <span>{item.trend}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ==========================================
          3. PRODUCTIVITY TIMELINE & HEATMAP
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart (Cols 1,2) */}
        <TimelineChart />

        {/* Heatmap Card (Col 3) */}
        <Card className="flex flex-col justify-between space-y-4 bg-zinc-900/30 border-white/[0.04]">
          <div className="border-b border-white/[0.04] pb-3">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2 text-left">
              <Calendar className="w-4 h-4 text-cyan-400" /> Focus Grid Intensity
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <ProductivityHeatmap />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 text-left pt-2 border-t border-white/[0.02]">
            Visual density tracks focused, undisturbed study blocks.
          </p>
        </Card>
      </div>

      {/* ==========================================
          4. CATEGORY DISTRIBUTION & WEEKLY PROGRESS
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart (Col 1) */}
        <Card className="space-y-4 bg-zinc-900/30 border-white/[0.04]">
          <div className="border-b border-white/[0.04] pb-3">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2 text-left">
              <Workflow className="w-4 h-4 text-purple-400" /> Category Distribution
            </h3>
          </div>
          <TaskDonutChart />
        </Card>

        {/* Comparison Dual Card (Cols 2,3) */}
        <Card className="lg:col-span-2 space-y-4 bg-zinc-900/30 border-white/[0.04]">
          <div className="border-b border-white/[0.04] pb-3">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2 text-left">
              <Workflow className="w-4 h-4 text-emerald-400" /> Weekly Progress (Last Week vs This Week)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-1 text-left">
            {COMPARISON_DATA.map((comp, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-300">{comp.name}</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{comp.change}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500">LAST WEEK</span>
                    <span className="font-bold text-zinc-300">{comp.lastVal}</span>
                  </div>
                  <div className="h-4 w-px bg-white/[0.08]" />
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-500">THIS WEEK</span>
                    <span className="font-bold text-blue-400">{comp.thisVal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ==========================================
          5. MILESTONE PROGRESS & ACHIEVEMENTS
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Achievements (Cols 1,2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider text-left">
            Earned Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {BADGES_DATA.map((bdg, idx) => {
              const Icon = bdg.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, rotate: [0, -2, 2, 0], scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center relative overflow-hidden group cursor-pointer ${bdg.color}`}
                >
                  <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center mb-3 border border-white/[0.04]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">{bdg.title}</h4>
                  <p className="text-[9px] text-zinc-500 leading-tight mt-1 font-light">{bdg.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Circular Progress Rings (Col 3) */}
        <div className="space-y-4 flex flex-col">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider text-left">
            Milestone Progress
          </h3>
          <div className="space-y-3 flex-grow flex flex-col justify-between">
            <CircularProgress percent={94} title="100 Tasks Goal" subtitle="Delivery Volume" color="#10b981" icon={CheckCircle2} />
            <CircularProgress percent={80} title="Deep Work Goal" subtitle="Focus Stamina" color="#3b82f6" icon={Zap} />
            <CircularProgress percent={85} title="Milestones Met" subtitle="Sprints Secure" color="#06b6d4" icon={Target} />
          </div>
        </div>

      </div>

    </motion.div>
  );
};
