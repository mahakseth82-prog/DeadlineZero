/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, TaskPriority, TaskStatus, RiskLevel } from '../../types';
import { formatDuration } from './time';

export interface TriageOutput {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  recommendation: string;
  isOverdue: boolean;
}

/**
 * Reusable utility to compute risk score, risk level, overdue state, 
 * and detailed AI recommendations based on task parameters and the overall user workload.
 */
export function calculateTaskRisk(task: Task, allTasks: Task[]): TriageOutput {
  const now = new Date();
  const deadlineDate = new Date(task.deadline);
  
  // Overdue status check
  const isOverdue = deadlineDate.getTime() < now.getTime() && task.status !== TaskStatus.COMPLETED;

  // Completed tasks have no risk
  if (task.status === TaskStatus.COMPLETED) {
    return {
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
      recommendation: 'Task is completed! Excelled under zero-deadline conditions.',
      isOverdue: false,
    };
  }

  if (isOverdue) {
    return {
      riskScore: 100,
      riskLevel: RiskLevel.CRITICAL,
      recommendation: 'CRITICAL OVERDUE: This task has passed its deadline! Immediately reschedule or activate Panic Mode to prevent severe fallout.',
      isOverdue: true,
    };
  }

  // Calculate time remaining in hours
  const msRemaining = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = Math.max(0.1, msRemaining / (1000 * 60 * 60));

  // 1. Time Urgency Factor (up to 55 points)
  let timePoints = 0;
  if (hoursRemaining <= 3) {
    timePoints = 55;
  } else if (hoursRemaining <= 8) {
    timePoints = 45;
  } else if (hoursRemaining <= 24) {
    timePoints = 35;
  } else if (hoursRemaining <= 48) {
    timePoints = 20;
  } else if (hoursRemaining <= 168) { // 7 days
    timePoints = 10;
  }

  // 2. Priority Weight Factor (up to 25 points)
  let priorityPoints = 0;
  switch (task.priority) {
    case TaskPriority.CRITICAL:
      priorityPoints = 25;
      break;
    case TaskPriority.HIGH:
      priorityPoints = 18;
      break;
    case TaskPriority.MEDIUM:
      priorityPoints = 10;
      break;
    case TaskPriority.LOW:
      priorityPoints = 3;
      break;
  }

  // 3. Feasibility Factor (Workload density ratio - up to 30 points)
  // ratio = requiredMinutes / availableMinutes
  const requiredMinutes = task.estimatedTime;
  const availableMinutes = hoursRemaining * 60;
  const ratio = requiredMinutes / availableMinutes;
  
  let feasibilityPoints = 0;
  if (ratio >= 1.0) {
    feasibilityPoints = 30; // Mathematical impossibility/extreme pressure
  } else if (ratio >= 0.5) {
    feasibilityPoints = 20;
  } else if (ratio >= 0.2) {
    feasibilityPoints = 10;
  } else if (ratio >= 0.05) {
    feasibilityPoints = 5;
  }

  // 4. Current Workload Congestion Factor (up to 15 points)
  // Calculated using other active, incomplete tasks
  const otherIncompleteTasks = allTasks.filter(
    (t) => t.id !== task.id && t.status !== TaskStatus.COMPLETED
  );
  const totalWorkloadMinutes = otherIncompleteTasks.reduce(
    (sum, t) => sum + t.estimatedTime,
    0
  );
  const workloadHours = totalWorkloadMinutes / 60;

  let workloadPoints = 0;
  if (workloadHours > 12) {
    workloadPoints = 15;
  } else if (workloadHours > 6) {
    workloadPoints = 10;
  } else if (workloadHours > 3) {
    workloadPoints = 5;
  }

  // Sum points and clamp to 0-100
  let totalScore = timePoints + priorityPoints + feasibilityPoints + workloadPoints;
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Critical adjustments for extremely imminent critical tasks
  if (hoursRemaining < 6 && task.priority === TaskPriority.CRITICAL) {
    totalScore = Math.max(92, totalScore);
  } else if (hoursRemaining < 12 && task.priority === TaskPriority.HIGH) {
    totalScore = Math.max(78, totalScore);
  }

  // Determine risk level based on score
  let riskLevel = RiskLevel.LOW;
  if (totalScore >= 86) {
    riskLevel = RiskLevel.CRITICAL;
  } else if (totalScore >= 66) {
    riskLevel = RiskLevel.HIGH;
  } else if (totalScore >= 36) {
    riskLevel = RiskLevel.MEDIUM;
  }

  // Generate dynamic, context-aware recommendation
  let recommendation = '';
  if (riskLevel === RiskLevel.CRITICAL) {
    if (ratio >= 1.0) {
      recommendation = `CRITICAL CAPACITY ALERT: Mathematical overload! You need ${formatDuration(requiredMinutes)} of work but only have ${hoursRemaining.toFixed(1)}h before deadline. Immediately activate emergency Panic Mode to execute a structured sprint.`;
    } else {
      recommendation = `CRITICAL RISK: Extremely tight ${hoursRemaining.toFixed(1)}h window. Recommended action: Lock down your schedule, link this task in the Focus Room, and activate ambient sound to bypass decision fatigue.`;
    }
  } else if (riskLevel === RiskLevel.HIGH) {
    recommendation = `HIGH RISK DETECTED: Deadline is closing in fast with a high workload density (Other active tasks: ${workloadHours.toFixed(1)}h). Recommended action: Postpone non-essential items, split this into subtasks, and start a Focus session now.`;
  } else if (riskLevel === RiskLevel.MEDIUM) {
    recommendation = `MEDIUM RISK: Looming deadline, but fully manageable with structured pacing. Recommended action: Schedule a 25-minute Pomodoro block today. Block out notifications to prevent progress drift.`;
  } else {
    recommendation = `LOW RISK: Safe buffer space (${hoursRemaining.toFixed(1)}h remaining). Recommended action: Proceed with standard pacing, check off your subtasks, and protect your streak!`;
  }

  return {
    riskScore: Math.round(totalScore),
    riskLevel,
    recommendation,
    isOverdue,
  };
}
