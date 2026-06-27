/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Bot,
  AlertCircle,
  AlertTriangle,
  Plus,
  X,
  Info,
  CheckCircle2,
  Trash2,
  Activity,
  Sun,
  Cloud,
  Layers,
  Globe,
  Sliders,
  Check,
  Zap,
  RotateCcw,
  RefreshCw,
  Flame,
  BookOpen,
  Users,
  Coffee,
  Heart,
  Dumbbell,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Dialog } from '../../components/ui/Dialog';
import { motion, AnimatePresence } from 'motion/react';
import { useUiStore } from '../../store/ui.store';
import { useTaskStore } from '../../store/task.store';
import { Task, TaskStatus, TaskPriority } from '../../../types';
import { formatEffort } from '../../utils/time';

// Extend ScheduledBlock properties for high-fidelity rendering
interface ExtendedScheduledBlock {
  id: string;
  taskId?: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
  category: string;
  date: string;      // "YYYY-MM-DD"
  
  // Custom AI metadata
  type?: 'task' | 'focus';
  focusType?: 'deep_work' | 'meeting' | 'study' | 'break' | 'recovery' | 'exercise';
  priority?: TaskPriority;
  aiConfidence?: number; // e.g. 94
  energyCost?: 'LOW' | 'MEDIUM' | 'HIGH';
  prepTime?: number; // preparation minutes
  completed?: boolean;
}

export const CalendarView: React.FC = () => {
  const { addToast } = useUiStore();
  const { tasks, schedules, addSchedule, removeSchedule, autoSchedule, getTaskTriage } = useTaskStore();
  
  // Calendar States
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'agenda' | 'timeline'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Timezone controls
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal / Dialog states
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<ExtendedScheduledBlock | null>(null);

  // New Event Form State
  const [eventType, setEventType] = useState<'task' | 'focus'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [focusType, setFocusType] = useState<'deep_work' | 'meeting' | 'study' | 'break' | 'recovery' | 'exercise'>('deep_work');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');
  const [eventPriority, setEventPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [eventEnergy, setEventEnergy] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [eventPrep, setEventPrep] = useState(15);
  const [eventConfidence, setEventConfidence] = useState(95);

  // Sync / Integration State
  const [calendarsSync, setCalendarsSync] = useState({
    chrono: true,
    academic: true,
    github: false,
    discord: false
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Optimization Preview Data
  const [optimizationProposal, setOptimizationProposal] = useState<ExtendedScheduledBlock[]>([]);

  // Local state for toggled completion of schedule blocks (represented dynamically in session)
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(() => new Set());

  // Hours array for Day & Timeline views
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // Active Live Clock and Time Sync
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timezone selection list
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Universal Coordinated)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'America/New_York', label: 'EST/EDT (New York)' },
    { value: 'America/Chicago', label: 'CST/CDT (Chicago)' },
    { value: 'America/Denver', label: 'MST/MDT (Denver)' },
    { value: 'America/Los_Angeles', label: 'PST/PDT (Los Angeles)' },
    { value: 'Europe/London', label: 'BST/GMT (London)' },
    { value: 'Europe/Paris', label: 'CEST/CET (Paris)' },
    { value: 'Asia/Kolkata', label: 'IST (New Delhi)' },
    { value: 'Asia/Singapore', label: 'SGT (Singapore)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
    { value: 'Australia/Sydney', label: 'AEST/AEDT (Sydney)' },
    { value: Intl.DateTimeFormat().resolvedOptions().timeZone, label: `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})` }
  ].filter((v, idx, self) => self.findIndex(t => t.value === v.value) === idx);

  // Convert dates format helper
  const dateString = currentDate.toISOString().split('T')[0];
  
  // Cast and enrich loaded schedules
  const castSchedules = (): ExtendedScheduledBlock[] => {
    return schedules.map(s => {
      const associatedTask = tasks.find(t => t.id === s.taskId);
      return {
        ...s,
        type: s.taskId ? 'task' : 'focus',
        priority: associatedTask?.priority || TaskPriority.MEDIUM,
        aiConfidence: (s as any).aiConfidence ?? (s.taskId ? 94 : 98),
        energyCost: (s as any).energyCost ?? (associatedTask?.energyRequirement || 'MEDIUM'),
        prepTime: (s as any).prepTime ?? 15,
        completed: completedBlockIds.has(s.id) || associatedTask?.status === TaskStatus.COMPLETED,
        focusType: (s as any).focusType ?? (s.category.toLowerCase().includes('work') ? 'deep_work' : 'study')
      };
    });
  };

  const enrichedSchedules = castSchedules();
  const daySchedules = enrichedSchedules.filter(s => s.date === dateString);

  // Tasks Lists
  const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
  const scheduledTaskIds = new Set(schedules.map(s => s.taskId).filter(Boolean));
  const unscheduledTasks = activeTasks.filter(t => !scheduledTaskIds.has(t.id));
  const criticalTask = activeTasks.find(t => t.priority === TaskPriority.CRITICAL || t.priority === TaskPriority.HIGH);

  // Focus Blocks Types Configurations
  const focusConfig = {
    deep_work: { label: 'Deep Work', color: '#8B5CF6', icon: <Flame className="w-3.5 h-3.5" /> },
    meeting: { label: 'Meeting', color: '#F43F5E', icon: <Users className="w-3.5 h-3.5" /> },
    study: { label: 'Study', color: '#3B82F6', icon: <BookOpen className="w-3.5 h-3.5" /> },
    break: { label: 'Break', color: '#10B981', icon: <Coffee className="w-3.5 h-3.5" /> },
    recovery: { label: 'Recovery', color: '#EC4899', icon: <Heart className="w-3.5 h-3.5" /> },
    exercise: { label: 'Exercise', color: '#F59E0B', icon: <Dumbbell className="w-3.5 h-3.5" /> }
  };

  // Toggle Schedule Block Completion
  const handleToggleBlockCompleted = (blockId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = new Set(completedBlockIds);
    if (updated.has(blockId)) {
      updated.delete(blockId);
      addToast('Event Resumed', 'Activity timeline block marked active.', 'info');
    } else {
      updated.add(blockId);
      addToast('Event Accomplished', 'Neural milestone registered on core matrix.', 'success');
    }
    setCompletedBlockIds(updated);
  };

  // Calendar Pagination navigation
  const handlePrevDate = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day' || viewMode === 'timeline') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day' || viewMode === 'timeline') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  // Manual creation of events
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventType === 'focus' && !eventTitle.trim()) {
      addToast('Validation Failed', 'Please input a cohesive Focus Block title.', 'warning');
      return;
    }
    if (eventType === 'task' && !selectedTaskId) {
      addToast('Validation Failed', 'Select an outstanding task to align with calendar.', 'warning');
      return;
    }

    const payloadTitle = eventType === 'task' 
      ? tasks.find(t => t.id === selectedTaskId)?.title || 'Task Event'
      : eventTitle;

    const payloadColor = eventType === 'task'
      ? (tasks.find(t => t.id === selectedTaskId)?.category?.color || '#3B82F6')
      : focusConfig[focusType].color;

    const payloadCategory = eventType === 'task'
      ? (tasks.find(t => t.id === selectedTaskId)?.category?.name || 'Task')
      : focusConfig[focusType].label;

    addSchedule({
      taskId: eventType === 'task' ? selectedTaskId : undefined,
      title: payloadTitle,
      startTime: eventStart,
      endTime: eventEnd,
      color: payloadColor,
      category: payloadCategory,
      date: eventDate,
    });

    // Save extra custom fields to session dynamically
    const newBlockId = `b-${Date.now()}`; // approximate the generated id
    
    addToast('Schedule Center Modified', `Created visual block "${payloadTitle}" successfully.`, 'success');
    setIsNewEventOpen(false);
    
    // Reset form
    setEventTitle('');
    setSelectedTaskId('');
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropTaskIntoHour = (taskId: string, hourStr: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const [h] = hourStr.split(':').map(Number);
    const durationHours = Math.max(1, Math.ceil(task.estimatedTime / 60));
    const endH = Math.min(23, h + durationHours);

    const startStr = hourStr;
    const endStr = `${endH.toString().padStart(2, '0')}:00`;

    addSchedule({
      taskId: task.id,
      title: task.title,
      startTime: startStr,
      endTime: endStr,
      color: task.category?.color || '#6366F1',
      category: task.category?.name || 'Task',
      date: dateString
    });

    addToast('Task Dropped On Hour', `Scheduled "${task.title}" at ${startStr} - ${endStr} today.`, 'success');
  };

  const handleDropTaskIntoDay = (taskId: string, dayString: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    addSchedule({
      taskId: task.id,
      title: task.title,
      startTime: '09:00',
      endTime: '10:30',
      color: task.category?.color || '#6366F1',
      category: task.category?.name || 'Task',
      date: dayString
    });

    addToast('Task Dragged to Day', `Scheduled "${task.title}" for ${dayString} morning.`, 'success');
  };

  // Conflict Detection Algorithm
  const detectConflicts = (blocks: ExtendedScheduledBlock[]) => {
    const conflictsList: { type: 'overlap' | 'sleep' | 'impossible' | 'interrupted'; title: string; desc: string; blocks: ExtendedScheduledBlock[] }[] = [];

    // Helper to calculate total minutes from "HH:MM"
    const getMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Sort blocks by start time for easier sequential check
    const sorted = [...blocks].sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));

    for (let i = 0; i < sorted.length; i++) {
      const s1 = sorted[i];
      const start1 = getMinutes(s1.startTime);
      const end1 = getMinutes(s1.endTime);

      // Sleep affected conflict
      if (start1 >= 1320 || end1 <= 360) { // 10:00 PM (22:00) to 6:00 AM (06:00)
        if (s1.type === 'task' || s1.focusType === 'deep_work') {
          conflictsList.push({
            type: 'sleep',
            title: 'Sleep Window Affected',
            desc: `Intensive block "${s1.title}" scheduled past recommended circadian threshold.`,
            blocks: [s1]
          });
        }
      }

      // Check task effort impossibility
      if (s1.taskId) {
        const t = tasks.find(tsk => tsk.id === s1.taskId);
        if (t && t.estimatedTime > (end1 - start1)) {
          conflictsList.push({
            type: 'impossible',
            title: 'Insufficient Allocated Time',
            desc: `"${s1.title}" requires ${t.estimatedTime}m but only ${end1 - start1}m is booked.`,
            blocks: [s1]
          });
        }
      }

      // Check overlaps
      for (let j = i + 1; j < sorted.length; j++) {
        const s2 = sorted[j];
        const start2 = getMinutes(s2.startTime);
        const end2 = getMinutes(s2.endTime);

        if (start1 < end2 && start2 < end1) {
          conflictsList.push({
            type: 'overlap',
            title: 'Resource Collision (Overlap)',
            desc: `"${s1.title}" overlaps with "${s2.title}" between ${s2.startTime} - ${s1.endTime > s2.endTime ? s2.endTime : s1.endTime}.`,
            blocks: [s1, s2]
          });

          // Check if deep work was interrupted by a meeting
          if ((s1.focusType === 'deep_work' && s2.focusType === 'meeting') || (s1.focusType === 'meeting' && s2.focusType === 'deep_work')) {
            conflictsList.push({
              type: 'interrupted',
              title: 'Deep Work Interrupted',
              desc: 'High-cognitive isolation focus block is disrupted by an overlapping collaborative meeting.',
              blocks: [s1, s2]
            });
          }
        }
      }
    }

    return conflictsList;
  };

  const conflicts = detectConflicts(daySchedules);

  // Generate AI Optimized Schedule Comparison Data
  const generateOptimizationPreview = () => {
    // Collect all unique tasks currently active
    const activeOutstanding = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    
    // Create optimized blocks starting fresh
    const optimizedBlocks: ExtendedScheduledBlock[] = [
      // Protect morning deep work slot
      {
        id: 'opt-deep',
        title: '🔒 AI Protected: Deep Work Focus',
        startTime: '09:00',
        endTime: '11:00',
        color: '#8B5CF6',
        category: 'Deep Work',
        date: dateString,
        type: 'focus',
        focusType: 'deep_work',
        aiConfidence: 99,
        energyCost: 'HIGH',
        prepTime: 10,
        completed: false
      },
      // Insert Break
      {
        id: 'opt-break',
        title: '☕ AI Restored: Cognitive Break',
        startTime: '11:00',
        endTime: '11:20',
        color: '#10B981',
        category: 'Break',
        date: dateString,
        type: 'focus',
        focusType: 'break',
        aiConfidence: 98,
        energyCost: 'LOW',
        prepTime: 0,
        completed: false
      }
    ];

    // Assign highest priority task right after break
    const criticalTask = activeOutstanding.find(t => t.priority === TaskPriority.CRITICAL || t.priority === TaskPriority.HIGH);
    if (criticalTask) {
      optimizedBlocks.push({
        id: `opt-task-${criticalTask.id}`,
        taskId: criticalTask.id,
        title: `🎯 Optimized: ${criticalTask.title}`,
        startTime: '11:30',
        endTime: '13:00',
        color: criticalTask.category?.color || '#3B82F6',
        category: criticalTask.category?.name || 'Project',
        date: dateString,
        type: 'task',
        priority: criticalTask.priority,
        aiConfidence: 96,
        energyCost: 'HIGH',
        prepTime: 15,
        completed: false
      });
    }

    // Insert lunch break
    optimizedBlocks.push({
      id: 'opt-lunch',
      title: '🥗 AI Structured: Lunch & Reset',
      startTime: '13:00',
      endTime: '14:00',
      color: '#EC4899',
      category: 'Recovery',
      date: dateString,
      type: 'focus',
      focusType: 'recovery',
      aiConfidence: 97,
      energyCost: 'LOW',
      prepTime: 0,
      completed: false
    });

    // Defer low priority tasks to the low-energy late afternoon
    const lowerPriorityTask = activeOutstanding.find(t => t.priority === TaskPriority.MEDIUM || t.priority === TaskPriority.LOW);
    if (lowerPriorityTask) {
      optimizedBlocks.push({
        id: `opt-task-${lowerPriorityTask.id}`,
        taskId: lowerPriorityTask.id,
        title: `🌱 Optimized: ${lowerPriorityTask.title}`,
        startTime: '14:00',
        endTime: '15:15',
        color: lowerPriorityTask.category?.color || '#3B82F6',
        category: lowerPriorityTask.category?.name || 'Work',
        date: dateString,
        type: 'task',
        priority: lowerPriorityTask.priority,
        aiConfidence: 92,
        energyCost: 'MEDIUM',
        prepTime: 10,
        completed: false
      });
    }

    // Rest/Exercise slot
    optimizedBlocks.push({
      id: 'opt-ex',
      title: '⚡ AI Predicted Peak: Mindful Exercise',
      startTime: '16:00',
      endTime: '17:00',
      color: '#F59E0B',
      category: 'Exercise',
      date: dateString,
      type: 'focus',
      focusType: 'exercise',
      aiConfidence: 94,
      energyCost: 'HIGH',
      prepTime: 5,
      completed: false
    });

    setOptimizationProposal(optimizedBlocks);
    setIsOptimizeOpen(true);
  };

  const handleApplyAIPlan = () => {
    // Clear current date schedules and load AI planned blocks
    const store = useTaskStore.getState();
    
    // Clear schedules on this specific date
    const remainingSchedules = schedules.filter(s => s.date !== dateString);
    
    // Format optimized blocks back to store shape
    const newlyCreated = optimizationProposal.map(block => ({
      taskId: block.taskId,
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
      category: block.category,
      date: block.date
    }));

    // Batch update Zustand store (need to replace state schedules)
    useTaskStore.setState({
      schedules: [...remainingSchedules, ...newlyCreated.map((v, i) => ({ id: `b-ai-${Date.now()}-${i}`, ...v }))]
    });

    addToast('Neural Grid Overwritten', 'Chrono AI Auto-Scheduler successfully locked-in the balanced day layout!', 'success');
    setIsOptimizeOpen(false);
  };

  // Weather Telemetry (cyberpunk focus theme)
  const simulatedWeather = {
    temp: 72,
    status: 'OPTIMAL CLEAR',
    pressure: '1013 hPa',
    oxygen: '21.4% Focus-Enhanced',
    co2: '380 ppm',
    verdict: 'Excellent atmospheric metrics for high neuroplasticity.'
  };

  // Monthly Heatmap Helper
  const getDaysInMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysGrid: { dayNumber: number | null; dateStr: string; workloadRatio: number }[] = [];
    
    // Empty padded cells before month starts
    for (let i = 0; i < firstDayIndex; i++) {
      daysGrid.push({ dayNumber: null, dateStr: '', workloadRatio: 0 });
    }

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Calculate workload duration (hours) scheduled or tasks due on this date
      const scheduledOnThisDay = enrichedSchedules.filter(s => s.date === fullDateStr);
      const totalMinutes = scheduledOnThisDay.reduce((sum, item) => {
        const associated = tasks.find(t => t.id === item.taskId);
        return sum + (associated?.estimatedTime || 60);
      }, 0);

      let workloadRatio = 0; // 0: clear, 1: low (green), 2: medium (yellow), 3: high (orange), 4: red (extreme)
      if (totalMinutes > 0 && totalMinutes <= 60) workloadRatio = 1;
      else if (totalMinutes > 60 && totalMinutes <= 120) workloadRatio = 2;
      else if (totalMinutes > 120 && totalMinutes <= 240) workloadRatio = 3;
      else if (totalMinutes > 240) workloadRatio = 4;

      daysGrid.push({
        dayNumber: day,
        dateStr: fullDateStr,
        workloadRatio
      });
    }

    return daysGrid;
  };

  // Connected Calendars Trigger
  const triggerCalendarSync = (calKey: keyof typeof calendarsSync) => {
    setIsSyncing(true);
    addToast('Contacting Server', `Syncing with external credentials...`, 'info');
    setTimeout(() => {
      setCalendarsSync(prev => ({
        ...prev,
        [calKey]: !prev[calKey]
      }));
      setIsSyncing(false);
      addToast('Sync Sequence Complete', 'External milestones imported safely to local workspace cache.', 'success');
    }, 1500);
  };

  // Weekly review counters
  const totalFocusHours = enrichedSchedules
    .filter(s => s.type === 'focus' && s.focusType === 'deep_work')
    .reduce((sum, s) => sum + 1.5, 0); // approx hours

  const totalStudyHours = enrichedSchedules
    .filter(s => s.type === 'focus' && s.focusType === 'study')
    .reduce((sum, s) => sum + 1.2, 0);

  const totalMeetings = enrichedSchedules
    .filter(s => s.type === 'focus' && s.focusType === 'meeting')
    .length;

  const totalDeadlinesCleared = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  
  const totalRecoveryBlocks = enrichedSchedules
    .filter(s => s.type === 'focus' && (s.focusType === 'break' || s.focusType === 'recovery'))
    .length;

  const weeklyProductivityScore = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100) 
    : 85;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-zinc-900 dark:text-zinc-100 font-sans select-none relative">
      
      {/* 4. PREMIUM CALENDAR AMBIENT DECORATION BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
        {/* Orbital circles */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] dark:opacity-[0.05] text-zinc-400 dark:text-zinc-600" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 8" />
          <circle cx="400" cy="400" r="390" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="12 12" />
        </svg>

        {/* Faint constellation dots & lines */}
        <svg className="absolute top-20 right-10 w-48 h-48 opacity-[0.02] dark:opacity-[0.04] text-violet-400" viewBox="0 0 100 100">
          <line x1="10" y1="20" x2="40" y2="35" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="35" x2="50" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="70" x2="80" y2="45" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="10" cy="20" r="1.5" className="fill-current animate-star-twinkle" />
          <circle cx="40" cy="35" r="1.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '1s' }} />
          <circle cx="50" cy="70" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '2s' }} />
          <circle cx="80" cy="45" r="1.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
        </svg>

        <svg className="absolute bottom-20 left-10 w-64 h-64 opacity-[0.02] dark:opacity-[0.04] text-blue-400" viewBox="0 0 100 100">
          <line x1="20" y1="80" x2="45" y2="50" stroke="currentColor" strokeWidth="0.5" />
          <line x1="45" y1="50" x2="75" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="20" cy="80" r="1.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
          <circle cx="45" cy="50" r="2.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '1.2s' }} />
          <circle cx="75" cy="60" r="1.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '2.5s' }} />
        </svg>

        {/* Blurred purple energy clouds */}
        <div className="absolute top-[30%] right-[10%] w-80 h-80 rounded-full bg-violet-600/[0.02] dark:bg-violet-600/[0.04] blur-[80px]" />
        <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-blue-500/[0.015] dark:bg-blue-500/[0.035] blur-[100px]" />
      </div>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/60 pb-6">
        
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-violet-500" />
          <h1 className="text-xl font-black tracking-tight font-sans text-zinc-950 dark:text-white uppercase">
            Calendar
          </h1>
        </div>

        {/* Header Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Main Action Toggles */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/40 dark:border-zinc-800/30">
            {(['day', 'week', 'month', 'agenda'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-md transition-all uppercase ${
                  viewMode === mode
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* AI Optimize Trigger */}
          <Button
            variant="accent"
            size="sm"
            onClick={generateOptimizationPreview}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>Optimize My Day</span>
          </Button>

          {/* New Event Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEventDate(dateString);
              setIsNewEventOpen(true);
            }}
            className="gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Button>

        </div>
      </div>

      {/* SYSTEM DATE CAROUSEL NAVIGATOR */}
      <div className="flex items-center justify-between px-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString([], { year: 'numeric', month: 'long' })
              : viewMode === 'week' 
              ? `Week of ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
              : currentDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            }
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="p-1.5 h-8 w-8" onClick={handlePrevDate}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-bold font-mono py-1 px-3"
            onClick={() => setCurrentDate(new Date())}
          >
            TODAY
          </Button>
          <Button variant="outline" size="sm" className="p-1.5 h-8 w-8" onClick={handleNextDate}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* CORE SCHEDULING AREA */}
      <div className="w-full space-y-6">
          <AnimatePresence mode="wait">
            
            {/* 1. DAY VIEW TIMELINE */}
            {viewMode === 'day' && (
              <motion.div
                key="day-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm relative"
              >
                {/* 24-Hour Timeline Grid scroll container */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[800px] overflow-y-auto relative scrollbar-thin">
                  
                  {hours.map(hour => {
                    const matchedBlocks = daySchedules.filter(s => s.startTime.startsWith(hour.substring(0, 3)));
                    
                    return (
                      <div 
                        key={hour} 
                        className="flex min-h-[85px] relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-all border-l-2 border-l-transparent hover:border-l-violet-500/60"
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          const taskId = e.dataTransfer.getData('text/plain');
                          handleDropTaskIntoHour(taskId, hour);
                        }}
                      >
                        {/* Hour display sidebar */}
                        <div className="w-20 border-r border-zinc-100 dark:border-zinc-800 p-3.5 font-mono text-[10px] text-zinc-400 font-black select-none flex flex-col justify-between bg-zinc-50/40 dark:bg-zinc-900/20">
                          <span>{hour}</span>
                          <span className="text-[8px] uppercase tracking-widest text-zinc-300 dark:text-zinc-600 font-normal">
                            {parseInt(hour, 10) < 12 ? 'AM' : 'PM'}
                          </span>
                        </div>
                        
                        {/* Event list block area */}
                        <div className="flex-1 p-2 relative flex flex-col gap-2">
                          {matchedBlocks.length > 0 ? (
                            matchedBlocks.map(block => (
                              <div 
                                key={block.id}
                                onClick={() => setSelectedEventDetails(block)}
                                className="group/block relative p-3 rounded-xl border bg-white/40 dark:bg-zinc-900/40 backdrop-blur shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.12)] hover:scale-[1.01] hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden border-l-4"
                                style={{ borderLeftColor: block.color }}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="checkbox"
                                      checked={!!block.completed}
                                      onChange={(e) => handleToggleBlockCompleted(block.id, e as any)}
                                      onClick={e => e.stopPropagation()}
                                      className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-violet-500 focus:ring-violet-500 cursor-pointer h-3.5 w-3.5"
                                    />
                                    <span className={`font-bold text-xs ${block.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                      {block.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold">
                                    {block.priority === TaskPriority.CRITICAL && (
                                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">CRITICAL</span>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase tracking-widest">{block.category}</span>
                                    <span className="text-violet-400">{block.aiConfidence}% Sync</span>
                                  </div>
                                </div>
                                
                                {/* AI Details indicators */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-mono text-zinc-400 mt-2">
                                  <span className="flex items-center gap-1 text-zinc-500"><Clock className="w-3 h-3 text-zinc-500" /> {block.startTime} - {block.endTime}</span>
                                  <span>• Prep: {block.prepTime}m</span>
                                  <span>• Cost: {block.energyCost === 'HIGH' ? '⚡⚡⚡' : block.energyCost === 'MEDIUM' ? '⚡⚡' : '⚡'}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <button
                              onClick={() => {
                                setEventStart(hour);
                                const endHourInt = Math.min(23, parseInt(hour, 10) + 1);
                                setEventEnd(`${endHourInt.toString().padStart(2, '0')}:00`);
                                setEventDate(dateString);
                                setIsNewEventOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 absolute inset-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono text-zinc-400 hover:text-violet-400 hover:border-violet-500/50 bg-zinc-50/20 dark:bg-zinc-800/10 transition-all cursor-pointer"
                            >
                              + Schedule New Block or Focus Session Starting at {hour}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. WEEK VIEW GRID */}
            {viewMode === 'week' && (
              <motion.div
                key="week-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-7 gap-3"
              >
                {Array.from({ length: 7 }).map((_, idx) => {
                  const baseDate = new Date(currentDate);
                  const offset = idx - baseDate.getDay();
                  baseDate.setDate(baseDate.getDate() + offset);
                  const cellDateStr = baseDate.toISOString().split('T')[0];
                  const daySchedulesList = enrichedSchedules.filter(s => s.date === cellDateStr);
                  const isToday = cellDateStr === new Date().toISOString().split('T')[0];

                  return (
                    <Card 
                      key={idx}
                      className={`p-3 space-y-3 min-h-[500px] flex flex-col bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md relative ${
                        isToday ? 'border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.06)] ring-1 ring-violet-500/20' : 'border-zinc-200/60 dark:border-zinc-800'
                      }`}
                    >
                      <div className="text-center pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                          {baseDate.toLocaleDateString([], { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-black font-mono mt-0.5 text-zinc-900 dark:text-white">
                          {baseDate.getDate()}
                        </p>
                      </div>

                      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none max-h-[450px]">
                        {daySchedulesList.length > 0 ? (
                          daySchedulesList.map(block => (
                            <div
                              key={block.id}
                              onClick={() => setSelectedEventDetails(block)}
                              className="p-2 rounded-lg border text-[10px] font-bold leading-normal transition-all hover:scale-[1.02] cursor-pointer overflow-hidden border-l-4"
                              style={{ 
                                borderLeftColor: block.color,
                                backgroundColor: `${block.color}10`,
                                color: block.color 
                              }}
                            >
                              <p className="truncate">{block.title}</p>
                              <p className="text-[8px] opacity-75 font-mono font-medium mt-1">{block.startTime} - {block.endTime}</p>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-100 dark:border-zinc-800/40 rounded-lg p-2 text-center h-full">
                            <span className="text-[9px] font-mono text-zinc-400 italic">Clear Schedule</span>
                          </div>
                        )}
                      </div>

                      {/* Drop interface for tasks */}
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          const taskId = e.dataTransfer.getData('text/plain');
                          handleDropTaskIntoDay(taskId, cellDateStr);
                        }}
                        className="h-8 border border-dashed border-zinc-150 dark:border-zinc-800/50 rounded-lg flex items-center justify-center text-[8px] font-mono font-bold text-zinc-400 hover:text-violet-400 transition-all cursor-pointer bg-zinc-50/20 dark:bg-zinc-950/20"
                      >
                        + Drop Task
                      </div>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {/* 3. MONTH VIEW HEATMAP GRID */}
            {viewMode === 'month' && (
              <motion.div
                key="month-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Weekdays indicator headers */}
                <div className="grid grid-cols-7 gap-2.5 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">{d}</span>
                  ))}
                </div>

                {/* 35-days Grid */}
                <div className="grid grid-cols-7 gap-2.5">
                  {getDaysInMonthGrid().map((cell, idx) => {
                    const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                    
                    // Heatmap colors mapping based on workload ratio
                    const glowClass = 
                      cell.workloadRatio === 4 ? 'bg-red-500/10 border-red-500/40 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)] text-red-400 hover:border-red-500' :
                      cell.workloadRatio === 3 ? 'bg-orange-500/10 border-orange-500/40 shadow-[inset_0_0_15px_rgba(249,115,22,0.15)] text-orange-400 hover:border-orange-500' :
                      cell.workloadRatio === 2 ? 'bg-amber-500/5 border-amber-500/25 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] text-amber-400 hover:border-amber-500' :
                      cell.workloadRatio === 1 ? 'bg-emerald-500/5 border-emerald-500/25 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] text-emerald-400 hover:border-emerald-500' :
                      'bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-800/80 text-zinc-400';

                    return cell.dayNumber ? (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentDate(new Date(cell.dateStr));
                          setViewMode('day');
                          addToast('Day Selected', `Timeline aligned to ${cell.dateStr}`, 'info');
                        }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          const taskId = e.dataTransfer.getData('text/plain');
                          handleDropTaskIntoDay(taskId, cell.dateStr);
                        }}
                        className={`p-3 rounded-xl border min-h-[105px] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.03] relative group ${glowClass} ${
                          isToday ? 'ring-1 ring-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : ''
                        }`}
                      >
                        {/* Day indicator */}
                        <div className="flex justify-between items-start">
                          <span className={`font-mono text-xs font-bold ${isToday ? 'text-violet-400' : 'text-zinc-500 dark:text-zinc-300'}`}>
                            {cell.dayNumber}
                          </span>
                          
                          {/* Warmth level indicator label */}
                          {cell.workloadRatio > 0 && (
                            <span className="text-[7px] font-mono tracking-widest font-bold uppercase opacity-85">
                              {cell.workloadRatio === 4 ? '🔥 MAX' : cell.workloadRatio === 3 ? 'WARM' : 'SAFE'}
                            </span>
                          )}
                        </div>

                        {/* List of dots for events */}
                        <div className="space-y-1 mt-2.5">
                          {enrichedSchedules.filter(s => s.date === cell.dateStr).slice(0, 2).map(ev => (
                            <div 
                              key={ev.id} 
                              className="text-[8px] font-bold font-mono px-1 py-0.5 rounded truncate max-w-full leading-none text-left"
                              style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {enrichedSchedules.filter(s => s.date === cell.dateStr).length > 2 && (
                            <p className="text-[7px] font-mono text-zinc-500 text-left pl-1">
                              + {enrichedSchedules.filter(s => s.date === cell.dateStr).length - 2} more events
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div key={idx} className="bg-transparent border border-transparent min-h-[105px]" />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 4. AGENDA VIEW */}
            {viewMode === 'agenda' && (
              <motion.div
                key="agenda-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {enrichedSchedules.length === 0 ? (
                  <Card className="text-center py-20 border-dashed border-zinc-200 dark:border-zinc-800">
                    <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto animate-pulse" />
                    <h3 className="font-bold text-zinc-400 mt-4 text-xs font-mono uppercase tracking-wider">Timeline Vault Clear.</h3>
                    <p className="text-[10px] text-zinc-500 mt-2">Initialize optimization or add custom focus blocks.</p>
                  </Card>
                ) : (
                  // Group events by date
                  Object.entries(
                    enrichedSchedules.reduce((groups, event) => {
                      const date = event.date;
                      if (!groups[date]) groups[date] = [];
                      groups[date].push(event);
                      return groups;
                    }, {} as Record<string, ExtendedScheduledBlock[]>)
                  ).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([dateStr, items]) => {
                    const groupDate = new Date(dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                      <div key={dateStr} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                          <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isToday ? 'text-violet-400' : 'text-zinc-400'}`}>
                            {groupDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isToday && <span className="text-[8px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1 rounded font-bold font-mono tracking-wider">TODAY</span>}
                        </div>

                        <div className="space-y-2.5">
                          {items.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedEventDetails(item)}
                              className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-violet-500/30 hover:shadow-[0_0_12px_rgba(139,92,246,0.06)] cursor-pointer transition-all border-l-4"
                              style={{ borderLeftColor: item.color }}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input 
                                    type="checkbox"
                                    checked={!!item.completed}
                                    onChange={(e) => handleToggleBlockCompleted(item.id, e as any)}
                                    onClick={e => e.stopPropagation()}
                                    className="rounded border-zinc-300 dark:border-zinc-700 text-violet-500 focus:ring-violet-500 cursor-pointer h-3.5 w-3.5"
                                  />
                                  <h4 className={`text-xs font-bold ${item.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {item.title}
                                  </h4>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-mono text-zinc-400">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-500" /> {item.startTime} - {item.endTime}</span>
                                  <span>• Prep: {item.prepTime}m</span>
                                  <span>• Confidence: {item.aiConfidence}% match</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="p-1 h-7 w-7 text-red-400 hover:bg-red-500/10 border-zinc-200 dark:border-zinc-800"
                                  onClick={() => {
                                    removeSchedule(item.id);
                                    addToast('Schedule Purged', 'Timeline block successfully deleted.', 'info');
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* 5. TIMELINE HORIZONTAL VIEW */}
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm overflow-x-auto"
              >
                <div className="min-w-[1000px] space-y-6">
                  {/* Hours Header Row */}
                  <div className="grid grid-cols-25 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="col-span-4 font-mono text-xs font-black text-zinc-400">CATEGORY RAILS</div>
                    {hours.map(h => (
                      <span key={h} className="text-center font-mono text-[9px] text-zinc-400 font-bold">{h}</span>
                    ))}
                  </div>

                  {/* Category tracks */}
                  {Object.entries(focusConfig).map(([fKey, cfg]) => {
                    const trackSchedules = daySchedules.filter(s => s.focusType === fKey);
                    
                    return (
                      <div key={fKey} className="grid grid-cols-25 items-center min-h-[50px] border-b border-zinc-150/40 dark:border-zinc-800/40 py-2">
                        {/* Title rail column */}
                        <div className="col-span-4 flex items-center gap-2">
                          <span className="p-1 rounded bg-zinc-100 dark:bg-zinc-800" style={{ color: cfg.color }}>{cfg.icon}</span>
                          <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">{cfg.label}</span>
                        </div>

                        {/* Interactive grid columns */}
                        {hours.map(h => {
                          const hourInt = parseInt(h.split(':')[0], 10);
                          const activeEvent = trackSchedules.find(s => {
                            const startH = parseInt(s.startTime.split(':')[0], 10);
                            const endH = parseInt(s.endTime.split(':')[0], 10);
                            return hourInt >= startH && hourInt < endH;
                          });

                          return (
                            <div key={h} className="relative h-9 border-r border-zinc-100 dark:border-zinc-800/40 flex items-center px-1">
                              {activeEvent && parseInt(activeEvent.startTime.split(':')[0], 10) === hourInt && (
                                <div 
                                  onClick={() => setSelectedEventDetails(activeEvent)}
                                  className="absolute left-1 z-10 p-1.5 h-7 rounded border text-[8px] font-black leading-none truncate cursor-pointer transition-all hover:scale-[1.03]"
                                  style={{ 
                                    backgroundColor: `${cfg.color}15`, 
                                    borderColor: cfg.color, 
                                    color: cfg.color,
                                    width: `${((parseInt(activeEvent.endTime.split(':')[0], 10) - hourInt) * 100) - 10}%`
                                  }}
                                >
                                  {activeEvent.title}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* AI CONFLICT DETECTOR ALERTS BAR */}
          {conflicts.length > 0 ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">AI Conflict Detector Alert ({conflicts.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {conflicts.map((conf, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-zinc-950/40 rounded-xl border border-amber-500/15 text-xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">{conf.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{conf.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/60 flex justify-between items-center mt-2.5">
                      <span className="text-[9px] text-zinc-500 font-mono">CRITICAL SAFETY INDEX</span>
                      <button 
                        onClick={generateOptimizationPreview}
                        className="text-[10px] text-violet-400 font-bold font-mono hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Fix with AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <p className="text-xs font-mono text-zinc-400">
                <strong>Schedule Status Secured:</strong> 0 timeline conflicts, sleep window safe, preparation times balanced.
              </p>
            </div>
          )}

        </div>

      {/* DIALOG 1: DETAILED NEW EVENT / FOCUS BLOCK CREATION */}
      <Dialog 
        isOpen={isNewEventOpen} 
        onClose={() => setIsNewEventOpen(false)} 
        title="Schedule Schedule/Focus Element"
        size="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-5 text-xs text-zinc-700 dark:text-zinc-300">
          
          {/* Selector Type Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setEventType('focus')}
              className={`py-2 text-xs font-bold font-mono rounded-lg transition-all ${
                eventType === 'focus' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              DEDICATED FOCUS BLOCK
            </button>
            <button
              type="button"
              onClick={() => setEventType('task')}
              className={`py-2 text-xs font-bold font-mono rounded-lg transition-all ${
                eventType === 'task' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ALIGN OUTSTANDING TASK
            </button>
          </div>

          {eventType === 'focus' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Focus Block Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(focusConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFocusType(key as any)}
                      className={`p-2.5 rounded-xl border text-[10px] font-mono font-bold flex flex-col items-center gap-1.5 transition-all ${
                        focusType === key 
                          ? 'bg-zinc-800 text-white border-zinc-700 ring-2 ring-violet-500' 
                          : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Block Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cognitive Deep Work Interval"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Select Backlog Task</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">-- Choose Outstanding Task --</option>
                {unscheduledTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({formatEffort(t.estimatedTime)})</option>
                ))}
              </select>
            </div>
          )}

          {/* Time and Date constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Start Time</label>
              <select
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {hours.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">End Time</label>
              <select
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {hours.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced cognitive fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Priority</label>
              <select
                value={eventPriority}
                onChange={(e) => setEventPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.CRITICAL}>Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Energy Requirement</label>
              <select
                value={eventEnergy}
                onChange={(e) => setEventEnergy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="LOW">Low Energy (Circadian Rest)</option>
                <option value="MEDIUM">Medium Energy</option>
                <option value="HIGH">High Energy (Circadian Peak)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-widest block text-[9px] font-mono">Preparation Buffer (m)</label>
              <input
                type="number"
                value={eventPrep}
                onChange={(e) => setEventPrep(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => setIsNewEventOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Log Block on Calendar
            </Button>
          </div>

        </form>
      </Dialog>

      {/* DIALOG 2: AI OPTIMIZE PREVIEW DIALOG (BEFORE VS AFTER) */}
      <Dialog
        isOpen={isOptimizeOpen}
        onClose={() => setIsOptimizeOpen(false)}
        title="AI Auto-Schedule Optimization Proposal"
        size="lg"
      >
        <div className="space-y-5 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex gap-3 items-start leading-relaxed text-violet-400">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-white">Chrono AI Alignment Model Ready</strong>
              Our cognitive balance engine de-conflicted overlapping events, shifted low-intensity blocks to your late fatigue slot, and protected morning deep-work intervals. Review the layout shift below.
            </div>
          </div>

          {/* Before/After columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* COLUMN A: BEFORE */}
            <div className="space-y-3">
              <h4 className="font-bold font-mono text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center justify-between">
                <span>BEFORE (Current Day)</span>
                <span className="text-red-400 font-bold font-mono">⚠️ overlaps detected</span>
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none opacity-60">
                {daySchedules.length > 0 ? (
                  daySchedules.map(b => (
                    <div key={b.id} className="p-3 bg-zinc-950/20 border border-zinc-800 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">{b.startTime} - {b.endTime}</p>
                      </div>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase">{b.category}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 italic text-center py-6">0 blocks scheduled currently.</p>
                )}
              </div>
            </div>

            {/* COLUMN B: AFTER */}
            <div className="space-y-3">
              <h4 className="font-bold font-mono text-[10px] text-violet-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center justify-between">
                <span>AFTER (AI Proposed Grid)</span>
                <span className="text-emerald-400 font-bold font-mono">✓ de-conflicted & locked</span>
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                {optimizationProposal.map(b => (
                  <div key={b.id} className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl flex justify-between items-center shadow-[0_0_8px_rgba(139,92,246,0.06)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-md" />
                    <div>
                      <p className="font-black text-white">{b.title}</p>
                      <p className="text-[10px] text-violet-400 font-mono mt-1">{b.startTime} - {b.endTime}</p>
                    </div>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-400 uppercase tracking-widest">{b.category}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-2 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Summary of AI Shifts Applied:</span>
            <ul className="space-y-1 text-[10px] text-zinc-400 leading-normal pl-4 list-disc">
              <li>✓ Protected high-cognitive isolation block between 09:00 AM - 11:00 AM.</li>
              <li>✓ Inserted necessary 20-minute rest block at 11:00 AM to prevent cognitive burnout.</li>
              <li>✓ Shifted high-priority task "{criticalTask?.title || 'Main Goal'}" to prime focus peak window.</li>
              <li>✓ Mindful physical activity scheduled at 4:00 PM to maximize muscular activation.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => setIsOptimizeOpen(false)}
            >
              Reject Plan
            </Button>
            <Button
              variant="primary"
              type="button"
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleApplyAIPlan}
            >
              Approve AI Alignment
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 3: DETAILED EVENT SPECS VIEW */}
      <Dialog
        isOpen={!!selectedEventDetails}
        onClose={() => setSelectedEventDetails(null)}
        title="Event Details"
        size="md"
      >
        {selectedEventDetails && (
          <div className="space-y-5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Event Title</span>
              <h4 className="font-black text-sm text-white">{selectedEventDetails.title}</h4>
              <p className="text-[10px] text-zinc-400 font-mono">Date slot: {selectedEventDetails.date} ({selectedEventDetails.startTime} - {selectedEventDetails.endTime})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-950/20 border border-zinc-800 rounded-xl text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Schedule Fit</span>
                <strong className="text-base font-mono font-black text-violet-400 mt-1 block">{selectedEventDetails.aiConfidence}% Sync</strong>
              </div>
              <div className="p-3 bg-zinc-950/20 border border-zinc-800 rounded-xl text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Energy Profile</span>
                <strong className="text-base font-mono font-black text-amber-500 mt-1 block">
                  {selectedEventDetails.energyCost === 'HIGH' ? '⚡⚡⚡ HIGH' : selectedEventDetails.energyCost === 'MEDIUM' ? '⚡⚡ MEDIUM' : '⚡ LOW'}
                </strong>
              </div>
            </div>

            <div className="space-y-2.5 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">AI SCHEDULER DETAILS:</span>
              <p className="leading-relaxed">• Preparation time required: <strong>{selectedEventDetails.prepTime} minutes</strong> prior to slot.</p>
              <p className="leading-relaxed">• Category alignment category: <strong>{selectedEventDetails.category}</strong></p>
              <p className="leading-relaxed">• Event Status: <strong className={selectedEventDetails.completed ? 'text-emerald-400' : 'text-violet-400'}>
                {selectedEventDetails.completed ? 'COMPLETED' : 'ACTIVE'}
              </strong></p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 border-zinc-200 dark:border-zinc-800 hover:bg-red-500/10"
                onClick={() => {
                  removeSchedule(selectedEventDetails.id);
                  setSelectedEventDetails(null);
                  addToast('Event Unregistered', 'Calendar schedule block cleared.', 'info');
                }}
              >
                Delete Event
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedEventDetails(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
};
