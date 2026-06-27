/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum TaskPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE',
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  avatar?: string;
  bio?: string;
  occupation?: string;
  goals: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  productivityScore: number;
  focusScore: number;
  timezone: string;
  currentStreak: number;
  longestStreak: number;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  deadline: string; // ISO date string
  priority: TaskPriority;
  status: TaskStatus;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  categoryId?: string;
  category?: Category;
  recurrenceType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  subtasks: Subtask[];
  notes?: string;
  difficultyScore?: number; // 1-10
  energyRequirement?: 'LOW' | 'MEDIUM' | 'HIGH';
  project?: string;
  attachments?: string[];
  pomodoroCycles?: number;
  tags?: string[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiskPrediction {
  id: string;
  taskId: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  explanation: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  duration: number; // in seconds
  productivityScore?: number; // 1 - 100
  completedAt: string;
}

export interface PanicSession {
  id: string;
  userId: string;
  triggeredReason: string;
  recoveryPlan?: string[]; // Array of structured roadmap steps
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  createdAt: string;
  suggestions?: string[];
  isError?: boolean;
  errorCode?: string;
  retryPrompt?: string;
}
