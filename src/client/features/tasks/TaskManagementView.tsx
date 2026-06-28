import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from "../../store/auth.store";
import { speechService } from "../../utils/speech";
import { 
  Bot, 
  Calendar, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Mic, 
  Grid, 
  List as ListIcon, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  Play, 
  Flame, 
  Zap, 
  RotateCcw,
  BookOpen,
  Volume2,
  ListCollapse,
  Layers,
  HelpCircle
} from 'lucide-react';

import { useTaskStore, getTaskProgress } from '../../store/task.store';
import { useFocusStore } from '../../store/focus.store';
import { usePanicStore } from '../../store/panic.store';
import { useUiStore } from '../../store/ui.store';
import { Task, TaskPriority, TaskStatus, Category, Subtask } from '../../../types';
import { calculateAIPriorityMetrics } from './TaskHelper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Dialog } from '../../components/ui/Dialog';

// Import our custom premium sub-components
import { TaskCard } from './TaskCard';
import { ChronoAIPanel } from './ChronoAIPanel';
import { DueTodayTimeline } from './DueTodayTimeline';
import { TaskFilters } from './TaskFilters';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';

export const TaskManagementView: React.FC = () => {
  const { addToast } = useUiStore();
  const { user } = useAuthStore();
  // Store actions and states
  const { 
    tasks, 
    categories, 
    schedules, 
    addTask, 
    updateTask, 
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask
  } = useTaskStore();

  // Layout states
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline' | 'compact'>('list');
  const [taskMousePos, setTaskMousePos] = useState({ x: 0, y: 0 });
  const handleTaskMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setTaskMousePos({ x, y });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('chrono_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter states (Multi-select)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);

  // Dialog and Side drawer states
  const [activeDetailTaskId, setActiveDetailTaskId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isVoiceDeckOpen, setIsVoiceDeckOpen] = useState(false);
  const [isPlanMyDayOpen, setIsPlanMyDayOpen] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  // Form states for creating/editing task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newDifficulty, setNewDifficulty] = useState<number>(5);
  const [newEnergy, setNewEnergy] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newProject, setNewProject] = useState('');
  const [newCatId, setNewCatId] = useState('cat-project');
  const [newEstTime, setNewEstTime] = useState<number>(60); // in minutes
  const [tempSubtasks, setTempSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Voice recognition / animation states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');

  // Local storage attachment mock
  const [attachments, setAttachments] = useState<Record<string, any[]>>(() => {
    try {
      const stored = localStorage.getItem('chrono_task_attachments');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveAttachments = (newAtts: Record<string, any[]>) => {
    setAttachments(newAtts);
    localStorage.setItem('chrono_task_attachments', JSON.stringify(newAtts));
  };

  // Live countdown stats calculation
  const [liveClockStr, setLiveClockStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClockStr(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync Search Query to localStorage
  const handleExecuteSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    const filtered = [cleanQuery, ...recentSearches.filter(s => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem('chrono_recent_searches', JSON.stringify(filtered));
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('chrono_recent_searches');
  };

  // Core calculations
  const completedTasksCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const pendingTasksCount = tasks.length - completedTasksCount;
  const productivityScore = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Filter Tasks logic
  const filteredTasks = tasks.filter(task => {
    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = task.title.toLowerCase().includes(q) || 
                        (task.description || '').toLowerCase().includes(q) ||
                        (task.project || '').toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // 2. Category multi-select
    if (
  selectedCategories.length > 0 &&
  !selectedCategories.includes(task.categoryId ?? "")
) {
  return false;
}

    // 3. Priority multi-select
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) {
      return false;
    }

    // 4. Status multi-select
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) {
      return false;
    }

    // 5. Deadline Range multi-select (Due Date)
    if (selectedDeadlines.length > 0) {
      const now = Date.now();
      const dl = new Date(task.deadline).getTime();
      const isOverdue = dl < now && task.status !== TaskStatus.COMPLETED;
      
      const today = new Date();
      const isToday = new Date(task.deadline).getDate() === today.getDate() &&
                      new Date(task.deadline).getMonth() === today.getMonth();
                      
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      const isThisWeek = dl >= now && (dl - now) <= oneWeekMs;
      const isLater = (dl - now) > oneWeekMs;

      const matchOverdue = selectedDeadlines.includes('overdue') && isOverdue;
      const matchToday = selectedDeadlines.includes('today') && isToday;
      const matchThisWeek = selectedDeadlines.includes('thisWeek') && isThisWeek;
      const matchLater = selectedDeadlines.includes('later') && isLater;

      if (!matchOverdue && !matchToday && !matchThisWeek && !matchLater) return false;
    }

    return true;
  });

  // Trigger auto schedule for single task
  const handleAutoSchedule = (task: Task) => {
    const now = new Date();
    let startTime = '14:00';
    let endTime = '15:30';
    let dateStr = now.toISOString().split('T')[0];

    if (now.getHours() >= 17) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      dateStr = tomorrow.toISOString().split('T')[0];
      startTime = '10:00';
      endTime = '11:30';
    }

    useTaskStore.getState().addSchedule({
      taskId: task.id,
      title: task.title,
      startTime,
      endTime,
      color: task.category?.color || '#8B5CF6',
      category: task.category?.name || 'General',
      date: dateStr
    });

    addToast('Scheduled on Calendar', `Anchored calendar block for ${dateStr} at ${startTime} - ${endTime}.`, 'success');
  };

  // Start focus room session integration
  const handleStartFocus = (task: Task) => {
    useFocusStore.getState().linkTask(task.id, task.title);
    useFocusStore.getState().setTimeRemaining(25 * 60);
    useFocusStore.getState().startTimer();
    addToast('Focus Session Initiated', `Linked task "${task.title}" to Focus Room & launched 25m Pomodoro loop!`, 'success');
  };

  // Panic Mode activation
  const handleTriggerPanic = (task: Task) => {
    const panicSteps = [
      { title: 'Deconstruct immediate next physiological step', durationMinutes: 15 },
      { title: 'Intense 45-minute isolated build session', durationMinutes: 45 },
      { title: 'Review deliverables & clear backlog blockers', durationMinutes: 30 }
    ];
    usePanicStore.getState().triggerPanic(task.id, task.title, 1.5, panicSteps);
    addToast('Panic Mode Activated', `Emergency sprint initiated for "${task.title}". Focus countdown loaded.`, 'warning');
  };

  // AI Breakdown checklist generator
  const handleTriggerAIBreakdown = async (task: Task) => {
  try {
    setIsBreakingDown(true);

    addToast(
      "Analyzing Task",
      "Chrono AI is breaking your task into executable steps...",
      "info"
    );

    const response = await fetch("/api/ai/task-breakdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskTitle: task.title,
        taskDescription: task.description,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate breakdown");
    }

    const data = await response.json();

    if (data.subtasks && Array.isArray(data.subtasks)) {
      data.subtasks.forEach((step: string) => {
        addSubtask(task.id, step);
      });

      addToast(
        "AI Breakdown Ready",
        `${data.subtasks.length} subtasks generated successfully.`,
        "success"
      );
    } else {
      addToast(
        "No Steps Generated",
        "Chrono AI couldn't generate subtasks.",
        "warning"
      );
    }
  } catch (err) {
    console.error(err);

    addToast(
      "AI Error",
      "Unable to contact Chrono AI.",
      "error"
    );
  } finally {
    setIsBreakingDown(false);
  }
};

  // Drag and Drop implementation for board view
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, { status });
      addToast('Board Pipeline Updated', `Shifted milestone to ${status.replace('_', ' ')}.`, 'success');
    }
  };

  // Save/Create task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const taskFields = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      notes: newNotes.trim(),
      deadline: newDeadline || new Date().toISOString(),
      priority: newPriority,
      estimatedTime: newEstTime,
      categoryId: newCatId,
      difficultyScore: newDifficulty,
      energyRequirement: newEnergy,
      project: newProject.trim() || 'General',
      status: editingTaskId ? undefined : TaskStatus.TODO,
    };

    if (editingTaskId) {
      updateTask(editingTaskId, taskFields);
      addToast('Milestone Configured', 'Task parameters updated successfully.', 'success');
    } else {
      addTask({
  ...taskFields,
  status: TaskStatus.TODO,
  subtasks: tempSubtasks,
  userId: user?.id ?? "",
});
      addToast('Objective Logged', 'Proactive milestone successfully injected into pipeline.', 'success');
    }

    setIsCreateDialogOpen(false);
    setEditingTaskId(null);
    setNewTitle('');
    setNewDesc('');
    setNewNotes('');
    setNewDeadline('');
    setNewPriority(TaskPriority.MEDIUM);
    setNewDifficulty(5);
    setNewEnergy('MEDIUM');
    setNewProject('');
    setTempSubtasks([]);
  };
const handleVoiceInput = async () => {
  try {
    setIsListening(true);

    const transcript = await speechService.startListening();

    setNewTitle(transcript);

    addToast(
      "Voice Captured",
      "Speech converted successfully.",
      "success"
    );
  } catch (error) {
    console.error(error);

    addToast(
      "Voice Error",
      "Unable to recognize speech.",
      "error"
    );
  } finally {
    setIsListening(false);
  }
};
  // Triggering Edit Mode
  const handleStartEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDesc(task.description || '');
    setNewNotes(task.notes || '');
    
    // Formatting date
    try {
      const d = new Date(task.deadline);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setNewDeadline(`${year}-${month}-${day}T${hours}:${minutes}`);
    } catch {
      setNewDeadline('');
    }

    setNewPriority(task.priority);
    setNewDifficulty(task.difficultyScore || 5);
    setNewEnergy(task.energyRequirement || 'MEDIUM');
    setNewProject(task.project || '');
   setNewCatId(task.categoryId ?? "");
    setNewEstTime(task.estimatedTime);
    setTempSubtasks(task.subtasks || []);
    setIsCreateDialogOpen(true);
  };

  // Voice command simulation
  const handleToggleVoice = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }
    setIsVoiceListening(true);
    setVoiceQuery('Listening to telemetry feed...');

    setTimeout(() => {
      setVoiceQuery('Sync "Review Google OAuth" with high difficulty level...');
    }, 2000);

    setTimeout(() => {
      setIsVoiceListening(false);
      setSearchQuery('Review Google OAuth');
      setSelectedPriorities([TaskPriority.HIGH]);
      addToast('Voice Query Compiled', 'Synchronized active pipeline filter to compiled search parameters.', 'success');
    }, 4000);
  };

  // Trigger "Plan My Day" scheduler
  const handleExecutePlanMyDay = () => {
    setIsPlanMyDayOpen(true);
  };

  const handleConfirmPlanMyDay = () => {
    // Automatically schedule today's top tasks
    const pendingToday = filteredTasks.filter(t => t.status !== TaskStatus.COMPLETED).slice(0, 3);
    pendingToday.forEach(task => {
      handleAutoSchedule(task);
    });
    setIsPlanMyDayOpen(false);
    addToast('Circadian Path Optimized', 'Chrono rescheduled backlog. Focus windows protected.', 'success');
  };

  // Attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeDetailTaskId || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const newAttach = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString()
    };
    const updated = {
      ...attachments,
      [activeDetailTaskId]: [...(attachments[activeDetailTaskId] || []), newAttach]
    };
    saveAttachments(updated);
    addToast('Resource Cached', `Successfully uploaded "${file.name}" to resource vault.`, 'success');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeDetailTaskId || !e.dataTransfer.files?.[0]) return;
    const file = e.dataTransfer.files[0];
    const newAttach = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString()
    };
    const updated = {
      ...attachments,
      [activeDetailTaskId]: [...(attachments[activeDetailTaskId] || []), newAttach]
    };
    saveAttachments(updated);
    addToast('Resource Cached', `Dropped resource "${file.name}" into resource vault.`, 'success');
  };

  const handleDeleteAttachment = (taskId: string, attId: string) => {
    const updated = {
      ...attachments,
      [taskId]: (attachments[taskId] || []).filter(a => a.id !== attId)
    };
    saveAttachments(updated);
    addToast('Resource Purged', 'Resource file cleared from pipeline storage.', 'info');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSelectedDeadlines([]);
    setSearchQuery('');
  };

  const activeTask = tasks.find(t => t.id === activeDetailTaskId) || null;

  return (
    <div 
      onMouseMove={handleTaskMouseMove}
      className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative"
    >
      
      {/* 1. PREMIUM INTUITIVE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-zinc-950/20 p-5 rounded-2xl border border-zinc-200/10 dark:border-zinc-800/60 relative overflow-hidden">
        
        <div className="flex items-center shrink-0 relative z-10">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            Tasks
          </h1>
        </div>

        {/* Search bar inside the header to satisfy "Search Tasks" requirement */}
        <div className="flex-1 max-w-md relative mx-0 lg:mx-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-transparent font-mono placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleExecutePlanMyDay}
            className="py-1.5 h-8.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border-none gap-1.5 shadow-lg shadow-violet-600/10"
          >
            <Sparkles className="w-3.5 h-3.5" /> Plan My Day
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="py-1.5 h-8.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-800 gap-1.5 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </Button>
        </div>
      </div>

      {/* 2. PILL FILTERS */}
      <TaskFilters
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedDeadlines={selectedDeadlines}
        setSelectedDeadlines={setSelectedDeadlines}
        onResetAll={handleResetFilters}
      />

      {/* 4. MAIN LAYOUT GRID (70% Task Board / 30% Recommendation Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        
        {/* LEFT COLUMN: TASK BOARD (70%) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* View Toggles header */}
          <div className="flex justify-between items-center border-b border-zinc-200/10 dark:border-zinc-800/40 pb-3">
            <span className="text-xs font-black font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" /> Task Board ({filteredTasks.length})
            </span>

            <div className="flex bg-zinc-900/50 p-0.5 rounded-xl border border-zinc-800/40 shrink-0">
              {(['kanban', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg uppercase transition-all ${
                    viewMode === mode 
                      ? 'bg-zinc-800 text-white shadow' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN VIEWS */}
          <AnimatePresence mode="wait">
            {/* 4.1. KANBAN BOARD */}
            {viewMode === 'kanban' && (
              <motion.div
                key="kanban-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10"
              >
                {/* 5. PREMIUM KANBAN BACKBOARD DECORATION */}
                <div 
                  style={{
                    transform: `translate3d(${taskMousePos.x}px, ${taskMousePos.y}px, 0)`,
                    transition: 'transform 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)'
                  }}
                  className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none"
                >
                  {/* Floating AI particles & connecting nodes */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.06] text-violet-500" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10%" y1="20%" x2="25%" y2="45%" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="25%" y1="45%" x2="15%" y2="80%" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50%" y1="15%" x2="65%" y2="40%" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="65%" y1="40%" x2="85%" y2="25%" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="45%" y1="75%" x2="60%" y2="85%" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="60%" y1="85%" x2="80%" y2="70%" stroke="currentColor" strokeWidth="0.5" />
                    
                    <circle cx="10%" cy="20%" r="2" className="fill-current animate-star-twinkle" />
                    <circle cx="25%" cy="45%" r="3" className="fill-current animate-star-twinkle" style={{ animationDelay: '1.2s' }} />
                    <circle cx="15%" cy="80%" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '0.8s' }} />
                    <circle cx="50%" cy="15%" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '2.5s' }} />
                    <circle cx="65%" cy="40%" r="3" className="fill-current animate-star-twinkle" style={{ animationDelay: '1.8s' }} />
                    <circle cx="85%" cy="25%" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '3.1s' }} />
                    <circle cx="45%" cy="75%" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '0.4s' }} />
                    <circle cx="60%" cy="85%" r="2.5" className="fill-current animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
                    <circle cx="80%" cy="70%" r="2" className="fill-current animate-star-twinkle" style={{ animationDelay: '2.2s' }} />
                  </svg>
                  
                  {/* Subtle Gradient Blobs behind Kanban cols */}
                  <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-violet-600/[0.02] dark:bg-violet-600/[0.04] blur-[80px]" />
                  <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-blue-500/[0.02] dark:bg-blue-500/[0.04] blur-[90px]" />
                  
                  {/* Drifting AI energy orbs */}
                  <div className="absolute top-[20%] left-[15%] w-36 h-36 rounded-full bg-violet-500/[0.03] blur-2xl pointer-events-none animate-orb-float" />
                  <div className="absolute top-[60%] right-[10%] w-44 h-44 rounded-full bg-blue-500/[0.02] blur-3xl pointer-events-none animate-orb-float" style={{ animationDelay: '3s' }} />
                  <div className="absolute bottom-[5%] left-[40%] w-32 h-32 rounded-full bg-purple-500/[0.03] blur-2xl pointer-events-none animate-orb-float" style={{ animationDelay: '1.5s' }} />
                </div>

                {/* COLUMN: TODO */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, TaskStatus.TODO)}
                  className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl min-h-[450px] space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800/40 pb-2">
                    <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest">Backlog</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-zinc-800 text-zinc-400">
                      {filteredTasks.filter(t => t.status === TaskStatus.TODO).length}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredTasks.filter(t => t.status === TaskStatus.TODO).length === 0 ? (
                      <div className="py-12 text-center text-[10px] font-mono text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        {/* SVG cybernetic radar */}
                        <svg className="w-8 h-8 mx-auto text-zinc-700 animate-pulse mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="4 4" />
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        Drag tasks here
                      </div>
                    ) : (
                      filteredTasks.filter(t => t.status === TaskStatus.TODO).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          viewMode="kanban"
                          onClick={() => setActiveDetailTaskId(task.id)}
                          onStatusChange={(status) => updateTask(task.id, { status })}
                          onEdit={(e) => handleStartEdit(task, e)}
                          onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                          onDuplicate={() => {}}
                          onStartFocus={() => handleStartFocus(task)}
                          onPanic={() => handleTriggerPanic(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN: IN PROGRESS */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, TaskStatus.IN_PROGRESS)}
                  className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl min-h-[450px] space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800/40 pb-2">
                    <span className="text-[10px] font-black font-mono text-violet-400 uppercase tracking-widest">In Progress</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-violet-500/10 text-violet-400">
                      {filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length === 0 ? (
                      <div className="py-12 text-center text-[10px] font-mono text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        <svg className="w-8 h-8 mx-auto text-zinc-700 animate-pulse mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="4 4" />
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        Drag tasks here
                      </div>
                    ) : (
                      filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          viewMode="kanban"
                          onClick={() => setActiveDetailTaskId(task.id)}
                          onStatusChange={(status) => updateTask(task.id, { status })}
                          onEdit={(e) => handleStartEdit(task, e)}
                          onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                          onDuplicate={() => {}}
                          onStartFocus={() => handleStartFocus(task)}
                          onPanic={() => handleTriggerPanic(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN: COMPLETED */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, TaskStatus.COMPLETED)}
                  className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl min-h-[450px] space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800/40 pb-2">
                    <span className="text-[10px] font-black font-mono text-emerald-400 uppercase tracking-widest">Completed</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-400">
                      {filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length === 0 ? (
                      <div className="py-12 text-center text-[10px] font-mono text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        <svg className="w-8 h-8 mx-auto text-zinc-700 animate-pulse mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="4 4" />
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        Drag tasks here
                      </div>
                    ) : (
                      filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          viewMode="kanban"
                          onClick={() => setActiveDetailTaskId(task.id)}
                          onStatusChange={(status) => updateTask(task.id, { status })}
                          onEdit={(e) => handleStartEdit(task, e)}
                          onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                          onDuplicate={() => {}}
                          onStartFocus={() => handleStartFocus(task)}
                          onPanic={() => handleTriggerPanic(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4.2. LIST VIEW */}
            {viewMode === 'list' && (
              <motion.div
                key="list-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
                    No active objectives registered under pipeline.
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      viewMode="list"
                      onClick={() => setActiveDetailTaskId(task.id)}
                      onStatusChange={(status) => updateTask(task.id, { status })}
                      onEdit={(e) => handleStartEdit(task, e)}
                      onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                      onDuplicate={() => {}}
                      onStartFocus={() => handleStartFocus(task)}
                      onPanic={() => handleTriggerPanic(task)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* 4.3. TIMELINE VIEW */}
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
                    No objectives registered under chronological timeline.
                  </div>
                ) : (
                  [...filteredTasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      viewMode="timeline"
                      onClick={() => setActiveDetailTaskId(task.id)}
                      onStatusChange={(status) => updateTask(task.id, { status })}
                      onEdit={(e) => handleStartEdit(task, e)}
                      onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                      onDuplicate={() => {}}
                      onStartFocus={() => handleStartFocus(task)}
                      onPanic={() => handleTriggerPanic(task)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* 4.4. COMPACT DATA VIEW */}
            {viewMode === 'compact' && (
              <motion.div
                key="compact-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
                    No high-density objectives cataloged.
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      viewMode="compact"
                      onClick={() => setActiveDetailTaskId(task.id)}
                      onStatusChange={(status) => updateTask(task.id, { status })}
                      onEdit={(e) => handleStartEdit(task, e)}
                      onDelete={(e) => { e.stopPropagation(); deleteTask(task.id); addToast('Milestone Deleted', 'Task purged from local backlog.', 'info'); }}
                      onDuplicate={() => {}}
                      onStartFocus={() => handleStartFocus(task)}
                      onPanic={() => handleTriggerPanic(task)}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: CHRONO ASSISTANT (30%) */}
        <div className="xl:col-span-3 space-y-6">
          <ChronoAIPanel
            tasks={tasks}
            productivityScore={productivityScore}
            onPanic={handleTriggerPanic}
            onStartFocus={handleStartFocus}
            onBreakdown={handleTriggerAIBreakdown}
            onOpenVoiceDeck={() => setIsCreateDialogOpen(true)}
          />

          <DueTodayTimeline
            tasks={tasks}
            onTaskClick={(taskId) => setActiveDetailTaskId(taskId)}
          />
        </div>
      </div>

      {/* 6. SLIDE-OVER DETAILS DRAWER */}
      <AnimatePresence>
        {activeDetailTaskId && activeTask && (
          <TaskDetailsDrawer
            activeTask={activeTask}
            allTasks={tasks}
            onClose={() => setActiveDetailTaskId(null)}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
            onRemoveSubtask={deleteSubtask}
            onTriggerAIBreakdown={handleTriggerAIBreakdown}
            isBreakingDown={isBreakingDown}
            onAutoSchedule={handleAutoSchedule}
            onStartFocus={handleStartFocus}
            onPanic={handleTriggerPanic}
            schedules={schedules}
            attachments={attachments}
            onFileUpload={handleFileUpload}
            onFileDrop={handleFileDrop}
            onDeleteAttachment={handleDeleteAttachment}
            onUpdateTask={updateTask}
            onAddToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* 7. CREATE / EDIT DIALOG FORM */}
      <AnimatePresence>
        {isCreateDialogOpen && (
          <Dialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            title={editingTaskId ? 'Configure Milestone Parameters' : 'Log Proactive Milestone Target'}
            size="md"
          >
            <form onSubmit={handleSaveTask} className="space-y-5 text-zinc-900 dark:text-zinc-100 font-sans">
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
  Objective Milestones Title
</label>

<div className="flex items-center gap-2">
  <Input
    type="text"
    placeholder="e.g. Complete Backend Authentication MVP"
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    required
    className="flex-1 text-xs bg-zinc-950 border-zinc-800 text-white"
  />

  <button
  type="button"
  onClick={handleVoiceInput}
  disabled={isListening}
  className={`h-10 px-3 rounded-lg flex items-center gap-2 transition-all ${
    isListening
      ? "bg-red-500 animate-pulse text-white"
      : "bg-violet-600 hover:bg-violet-700 text-white"
  }`}
>
  {isListening ? "🎙️ Listening..." : "🎤 Voice"}
</button>
</div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Strategic Description</label>
                  <textarea
                    placeholder="Provide scope guidelines and expectations..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50 text-white"
                  />
                </div>

                {/* Cognitive params */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80 space-y-4">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Priority calibration</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex justify-between">
                        <span>Difficulty Rating</span>
                        <span className="text-violet-400 font-bold">{newDifficulty}/10</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(Number(e.target.value))}
                        className="w-full accent-violet-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Energy Requirement</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setNewEnergy(lvl)}
                            className={`py-1 text-[9px] font-bold font-mono rounded border uppercase ${
                              newEnergy === lvl
                                ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Sprint Project Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Hackathon, CS301"
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        className="text-xs bg-zinc-950 border-zinc-800 text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Category Tag</label>
                      <select
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Deadline Target</label>
                    <Input
                      type="datetime-local"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      required
                      className="text-xs bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Priority Level</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.CRITICAL}>Critical Priority</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans">Estimated Duration (Minutes)</label>
                  <Input
                    type="number"
                    min="10"
                    value={newEstTime}
                    onChange={(e) => setNewEstTime(Number(e.target.value))}
                    className="text-xs bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800 font-mono">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400"
                >
                  CANCEL
                </Button>
                <Button 
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                  {editingTaskId ? 'APPLY CHANGES' : 'INJECT OBJECTIVE'}
                </Button>
              </div>
            </form>
          </Dialog>
        )}
      </AnimatePresence>

      {/* 8. "PLAN MY DAY" CHRONO SIMULATOR DIALOG */}
      <AnimatePresence>
        {isPlanMyDayOpen && (
          <Dialog
            isOpen={isPlanMyDayOpen}
            onClose={() => setIsPlanMyDayOpen(false)}
            title="Chrono Circadian Scheduling Engine"
            size="md"
          >
            <div className="space-y-5 text-zinc-300 font-mono text-xs">
              <div className="flex items-center gap-3 bg-violet-500/10 p-4 border border-violet-500/20 rounded-xl">
                <Bot className="w-6 h-6 text-violet-400 shrink-0" />
                <p className="text-[11px] leading-relaxed font-semibold">
                  Chrono AI is running strategic calibrations over your active pipeline metrics.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-900/35 border border-zinc-850 p-4 rounded-xl">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1 mb-2">Predicted Adjustments</p>
                <div className="space-y-2 text-[10px] leading-relaxed">
                  <p className="flex items-center gap-2"><span className="text-violet-400">&gt;&gt;</span> Protection of morning deep-focus window initiated (09:00 AM - 11:30 AM)</p>
                  <p className="flex items-center gap-2"><span className="text-violet-400">&gt;&gt;</span> Rescheduling 2 low-priority tasks past high-efficiency hours</p>
                  <p className="flex items-center gap-2"><span className="text-violet-400">&gt;&gt;</span> Auto-assigning calendar blocks for 3 active targets due today</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPlanMyDayOpen(false)}
                  className="bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-[10px]"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={handleConfirmPlanMyDay}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px]"
                >
                  OPTIMIZE MY DAY
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

    </div>
  );
};
