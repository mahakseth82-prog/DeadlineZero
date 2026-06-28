/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/storage';
import { Task, TaskPriority, TaskStatus, Category, Subtask, RiskLevel } from '../../types';
import { calculateTaskRisk, TriageOutput } from '../utils/triage';
import { TaskService } from "../services/TaskService";

// Seed categories
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-academic', name: 'Academic', color: '#10B981' },
  { id: 'cat-work', name: 'Work', color: '#3B82F6' },
  { id: 'cat-personal', name: 'Personal', color: '#EC4899' },
  { id: 'cat-health', name: 'Health', color: '#EF4444' },
  { id: 'cat-fitness', name: 'Fitness', color: '#F59E0B' },
  { id: 'cat-meeting', name: 'Meeting', color: '#8B5CF6' },
  { id: 'cat-project', name: 'Project', color: '#6366F1' },
  { id: 'cat-assignment', name: 'Assignment', color: '#06B6D4' },
  { id: 'cat-exam', name: 'Exam', color: '#D946EF' },
  { id: 'cat-learning', name: 'Learning', color: '#14B8A6' },
  { id: 'cat-research', name: 'Research', color: '#84CC16' },
  { id: 'cat-finance', name: 'Finance', color: '#22C55E' },
  { id: 'cat-shopping', name: 'Shopping', color: '#EAB308' },
  { id: 'cat-family', name: 'Family', color: '#F97316' },
  { id: 'cat-other', name: 'Other', color: '#71717A' }
];

export const getTaskProgress = (task: Task): number => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.status === TaskStatus.COMPLETED ? 100 : 0;
  }
  const completed = task.subtasks.filter((s) => s.completed).length;
  return Math.round((completed / task.subtasks.length) * 100);
};

// Seed merged initial tasks from Dashboard and Task Manager pools
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'usr-928374',
    title: 'Complete Hackathon MVP Core Architecture',
    description: 'Set up Prisma model bindings, routing configurations, and presentational elements.',
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    priority: TaskPriority.CRITICAL,
    status: TaskStatus.IN_PROGRESS,
    estimatedTime: 120,
    categoryId: 'cat-project',
    category: INITIAL_CATEGORIES[6],
    subtasks: [
      { id: 'sub-1', taskId: 'task-1', title: 'Write Prisma Schema definition', completed: true },
      { id: 'sub-2', taskId: 'task-1', title: 'Build visual page screens and loaders', completed: false },
      { id: 'sub-3', taskId: 'task-1', title: 'Inject mock state variables', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    userId: 'usr-928374',
    title: 'Prepare Slide Deck & Demo Video',
    description: 'Compose product slides highlighting unique value propositions of the AI triage loops.',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    estimatedTime: 90,
    categoryId: 'cat-assignment',
    category: INITIAL_CATEGORIES[7],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    userId: 'usr-928374',
    title: 'Review Google OAuth Token refresh cycle',
    description: 'Perform boundary checks for silent refresh interceptors.',
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    estimatedTime: 45,
    categoryId: 'cat-work',
    category: INITIAL_CATEGORIES[1],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-1',
    userId: 'usr-928374',
    title: 'Model Database Entity Relational diagrams',
    description: 'Ensure foreign keys support strict ON DELETE CASCADE constraints.',
    deadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // 10 hours from now
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    estimatedTime: 90,
    categoryId: 'cat-project',
    category: INITIAL_CATEGORIES[6],
    subtasks: [
      { id: 's-1', taskId: 't-1', title: 'Write diagram structures', completed: true },
      { id: 's-2', taskId: 't-1', title: 'Audit delete cascade actions', completed: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't-2',
    userId: 'usr-928374',
    title: 'Finalize Hackathon Demo slide assets',
    description: 'Summarize proactive recovery plans and AI-driven coaching advantages.',
    deadline: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(), // 30 hours from now
    priority: TaskPriority.CRITICAL,
    status: TaskStatus.TODO,
    estimatedTime: 120,
    categoryId: 'cat-project',
    category: INITIAL_CATEGORIES[6],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't-overdue-demo',
    userId: 'usr-928374',
    title: 'Submit Project Proposal Outline',
    description: 'Write abstract, system goals, and tech stack justifications.',
    deadline: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago (overdue!)
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    estimatedTime: 60,
    categoryId: 'cat-assignment',
    category: INITIAL_CATEGORIES[7],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface ScheduledBlock {
  id: string;
  taskId?: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
  category: string;
  date: string;      // "YYYY-MM-DD"
}

const INITIAL_SCHEDULES: ScheduledBlock[] = [
  {
    id: 'b-1',
    taskId: 'task-1',
    title: 'Complete Hackathon MVP Core Architecture',
    startTime: '09:00',
    endTime: '11:00',
    color: '#6366F1',
    category: 'Project',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'b-2',
    taskId: 't-1',
    title: 'Model Database Entity Relational diagrams',
    startTime: '13:00',
    endTime: '14:30',
    color: '#6366F1',
    category: 'Project',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'b-3',
    taskId: 'task-2',
    title: 'Prepare Slide Deck & Demo Video',
    startTime: '15:00',
    endTime: '16:30',
    color: '#06B6D4',
    category: 'Assignment',
    date: new Date().toISOString().split('T')[0],
  }
];

interface TaskState {
  tasks: Task[];
  categories: Category[];
  schedules: ScheduledBlock[];
  
  // Actions
  addTask: (taskData: {
    title: string;
    description?: string;
    deadline: string;
    priority: TaskPriority;
    status: TaskStatus;
    estimatedTime: number;
    categoryId?: string;
    notes?: string;
    userId: string;
    subtasks?: Subtask[];
    difficultyScore?: number;
    energyRequirement?: 'LOW' | 'MEDIUM' | 'HIGH';
    project?: string;
    attachments?: string[];
    pomodoroCycles?: number;
    tags?: string[];
    isArchived?: boolean;
  }) =>Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => void;
  loadTasks: (userId: string) => Promise<void>;
  // Subtasks actions
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Dynamic triage queries
  getTaskTriage: (taskId: string) => TriageOutput;
  getOverdueTasks: () => Task[];
  getHighRiskTasks: () => Task[];
  getCriticalTasks: () => Task[];
  getCrisisTasks: () => Task[];

  // Calendar schedule actions
  addSchedule: (schedule: Omit<ScheduledBlock, 'id'>) => void;
  removeSchedule: (scheduleId: string) => void;
  autoSchedule: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      loadTasks: async (userId: string) => {
  try {
    const tasks = await TaskService.getUserTasks(userId);

    set({
      tasks,
    });
  } catch (error) {
    console.error("Failed to load tasks:", error);
  }
},
      tasks: [],
      categories: INITIAL_CATEGORIES,
      schedules: INITIAL_SCHEDULES,

  addTask:async (taskData) => {
    const category = INITIAL_CATEGORIES.find((c) => c.id === taskData.categoryId);
    const taskId = `t-${Date.now()}`;
    const calculatedDifficulty = taskData.difficultyScore ?? (
      taskData.priority === TaskPriority.CRITICAL ? 8.5 :
      taskData.priority === TaskPriority.HIGH ? 6.5 :
      taskData.priority === TaskPriority.MEDIUM ? 4.5 : 2.5
    );
    const calculatedEnergy = taskData.energyRequirement ?? (
      taskData.priority === TaskPriority.CRITICAL ? 'HIGH' :
      taskData.priority === TaskPriority.HIGH ? 'HIGH' :
      taskData.priority === TaskPriority.MEDIUM ? 'MEDIUM' : 'LOW'
    );
    const calculatedPomodoro = taskData.pomodoroCycles ?? Math.max(1, Math.ceil(taskData.estimatedTime / 25));
    const calculatedProject = taskData.project || (category ? category.name : 'General');
    const calculatedTags = taskData.tags || (category ? [category.name.toLowerCase()] : []);

    const newTask: Task = {
      id: taskId,
    userId: taskData.userId,
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline,
      priority: taskData.priority,
      status: taskData.status,
      estimatedTime: taskData.estimatedTime,
      categoryId: taskData.categoryId,
      category,
      subtasks: taskData.subtasks ? taskData.subtasks.map(s => ({ ...s, id: s.id.startsWith('temp-') ? `sub-${Date.now()}-${Math.random()}` : s.id, taskId })) : [],
      notes: taskData.notes,
      difficultyScore: calculatedDifficulty,
      energyRequirement: calculatedEnergy,
      project: calculatedProject,
      attachments: taskData.attachments || [],
      pomodoroCycles: calculatedPomodoro,
      tags: calculatedTags,
      isArchived: taskData.isArchived || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
await TaskService.createTask(newTask);
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));
  },

  updateTask:async (taskId, updates) => {
    await TaskService.updateTask(taskId, updates);
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
          if (updates.categoryId) {
            updatedTask.category = state.categories.find((c) => c.id === updates.categoryId);
          }
          return updatedTask;
        }
        return task;
      });

      const updatedSchedules = state.schedules.map((s) => {
        if (s.taskId === taskId) {
          const task = updatedTasks.find(t => t.id === taskId);
          return {
            ...s,
            title: updates.title || s.title,
            category: task?.category?.name || s.category,
            color: task?.category?.color || s.color,
          };
        }
        return s;
      });

      return { tasks: updatedTasks, schedules: updatedSchedules };
    });
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      schedules: state.schedules.filter((s) => s.taskId !== taskId),
    }));
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          
          const totalCount = updatedSubtasks.length;
          const completedCount = updatedSubtasks.filter((s) => s.completed).length;
          let newStatus = task.status;
          
          if (totalCount > 0) {
            if (completedCount === totalCount) {
              newStatus = TaskStatus.COMPLETED;
            } else if (task.status === TaskStatus.COMPLETED && completedCount < totalCount) {
              newStatus = TaskStatus.IN_PROGRESS;
            }
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    }));
  },

  addSubtask: (taskId, title) => {
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      taskId,
      title,
      completed: false,
    };

    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = [...task.subtasks, newSub];
          let newStatus = task.status;
          
          if (task.status === TaskStatus.COMPLETED) {
            newStatus = TaskStatus.IN_PROGRESS;
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    }));
  },

  updateSubtask: (taskId, subtaskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, ...updates } : sub
          );
          
          const totalCount = updatedSubtasks.length;
          const completedCount = updatedSubtasks.filter((s) => s.completed).length;
          let newStatus = task.status;
          
          if (totalCount > 0) {
            if (completedCount === totalCount) {
              newStatus = TaskStatus.COMPLETED;
            } else if (task.status === TaskStatus.COMPLETED && completedCount < totalCount) {
              newStatus = TaskStatus.IN_PROGRESS;
            }
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    }));
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.filter((sub) => sub.id !== subtaskId);
          const totalCount = updatedSubtasks.length;
          const completedCount = updatedSubtasks.filter((s) => s.completed).length;
          let newStatus = task.status;
          
          if (totalCount > 0) {
            if (completedCount === totalCount) {
              newStatus = TaskStatus.COMPLETED;
            }
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    }));
  },

  getTaskTriage: (taskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return {
        riskScore: 0,
        riskLevel: RiskLevel.LOW,
        recommendation: 'Task not found.',
        isOverdue: false,
      };
    }
    return calculateTaskRisk(task, tasks);
  },

  getOverdueTasks: () => {
    const { tasks } = get();
    return tasks.filter((t) => {
      const isPast = new Date(t.deadline).getTime() < Date.now();
      return isPast && t.status !== TaskStatus.COMPLETED;
    });
  },

  getHighRiskTasks: () => {
    const { tasks } = get();
    return tasks.filter((t) => {
      const triage = calculateTaskRisk(t, tasks);
      return triage.riskLevel === RiskLevel.HIGH;
    });
  },

  getCriticalTasks: () => {
    const { tasks } = get();
    return tasks.filter((t) => {
      const triage = calculateTaskRisk(t, tasks);
      return triage.riskLevel === RiskLevel.CRITICAL;
    });
  },

  getCrisisTasks: () => {
    const { tasks } = get();
    const now = Date.now();
    return tasks.filter((t) => {
      if (t.status === TaskStatus.COMPLETED) return false;
      const triage = calculateTaskRisk(t, tasks);
      const isCritical = t.priority === TaskPriority.CRITICAL || triage.riskLevel === RiskLevel.CRITICAL;
      const isHighRisk = triage.riskScore > 80;
      const timeDiff = new Date(t.deadline).getTime() - now;
      const isImminent = timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000;
      return isCritical || isHighRisk || isImminent;
    });
  },

  addSchedule: (scheduleData) => {
    const newSchedule: ScheduledBlock = {
      id: `b-${Date.now()}`,
      ...scheduleData,
    };
    set((state) => ({
      schedules: [...state.schedules, newSchedule],
    }));
  },

  removeSchedule: (scheduleId) => {
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== scheduleId),
    }));
  },

  autoSchedule: () => {
    const { tasks, schedules } = get();
    const todayStr = new Date().toISOString().split('T')[0];

    // Get all incomplete tasks that aren't already scheduled on today's calendar
    const scheduledTaskIds = new Set(schedules.filter(s => s.date === todayStr).map(s => s.taskId));
    const unscheduledTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED && !scheduledTaskIds.has(t.id));

    if (unscheduledTasks.length === 0) return;

    // Find empty hours from 08:00 to 19:00
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // [8..19]

    const busyHours = new Set<number>();
    schedules.filter(s => s.date === todayStr).forEach(s => {
      const startHour = parseInt(s.startTime.split(':')[0], 10);
      const endHour = parseInt(s.endTime.split(':')[0], 10);
      for (let h = startHour; h < endHour; h++) {
        busyHours.add(h);
      }
    });

    let taskIndex = 0;
    const newSchedules: ScheduledBlock[] = [];

    for (const h of hours) {
      if (taskIndex >= unscheduledTasks.length) break;
      if (!busyHours.has(h)) {
        const task = unscheduledTasks[taskIndex];
        const durationHours = Math.max(1, Math.ceil(task.estimatedTime / 60));

        // Ensure we don't exceed the day range
        if (h + durationHours <= 20) {
          // Check if all hours for this block are free
          let conflict = false;
          for (let dh = h; dh < h + durationHours; dh++) {
            if (busyHours.has(dh)) conflict = true;
          }

          if (!conflict) {
            const startTime = `${h.toString().padStart(2, '0')}:00`;
            const endTime = `${(h + durationHours).toString().padStart(2, '0')}:00`;

            newSchedules.push({
              id: `b-ai-${Date.now()}-${task.id}`,
              taskId: task.id,
              title: `AI Scheduled: ${task.title}`,
              startTime,
              endTime,
              color: task.category?.color || '#6366F1',
              category: task.category?.name || 'AI Scheduled',
              date: todayStr,
            });

            // Mark hours as busy
            for (let bh = h; bh < h + durationHours; bh++) {
              busyHours.add(bh);
            }
            taskIndex++;
          }
        }
      }
    }

    if (newSchedules.length > 0) {
      set((state) => ({
        schedules: [...state.schedules, ...newSchedules],
      }));
    }
  },
}),
{
  name: 'deadlinezero-tasks',
  version: 1,
  storage: createJSONStorage(() => safeLocalStorage),

  partialize: (state) => ({
    categories: state.categories,
    schedules: state.schedules,
  }),

  migrate: (persistedState: any) => {
    return persistedState;
  },
}
  )
);