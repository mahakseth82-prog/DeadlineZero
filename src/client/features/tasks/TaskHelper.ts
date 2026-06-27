import { Task, TaskPriority, TaskStatus } from '../../../types';

export interface AIPriorityMetrics {
  urgencyScore: number;       // 1 - 100
  importanceScore: number;    // 1 - 100
  predictedCompletionMinutes: number;
  recommendedStartTime: string;
  deadlineRisk: {
    score: number;
    level: 'CRITICAL' | 'WARNING' | 'SAFE';
    badgeColor: string;
    neonGlow: string;
  };
  recoverySuggestion: string;
}

/**
 * Calculates all AI Priority Engine metrics for a given task.
 */
export function calculateAIPriorityMetrics(task: Task): AIPriorityMetrics {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

  // 1. Urgency Score (1-100)
  // Standard window of urgency: 72 hours (3 days). 
  // Tasks due in less than 2 hours get near 100. Over 3 days gets scaled down to 15.
  let urgencyScore = 15;
  if (diffHours <= 0) {
    urgencyScore = 100;
  } else if (diffHours <= 2) {
    urgencyScore = 95 + (2 - diffHours) * 2.5; // 95 - 100
  } else if (diffHours <= 24) {
    urgencyScore = 60 + (24 - diffHours) * (35 / 22); // 60 - 95
  } else if (diffHours <= 72) {
    urgencyScore = 15 + (72 - diffHours) * (45 / 48); // 15 - 60
  }
  urgencyScore = Math.min(100, Math.max(1, Math.round(urgencyScore)));

  // 2. Importance Score (1-100)
  // Driven by priority enum and the AI difficulty score (which defaults to 5.0)
  const baseDifficulty = task.difficultyScore || 5.0;
  let priorityWeight = 50;
  switch (task.priority) {
    case TaskPriority.CRITICAL:
      priorityWeight = 90;
      break;
    case TaskPriority.HIGH:
      priorityWeight = 75;
      break;
    case TaskPriority.MEDIUM:
      priorityWeight = 50;
      break;
    case TaskPriority.LOW:
      priorityWeight = 25;
      break;
  }
  let importanceScore = priorityWeight + (baseDifficulty * 1.0); // Adjust slightly for complexity
  importanceScore = Math.min(100, Math.max(1, Math.round(importanceScore)));

  // 3. Predicted Completion Time
  // Adjusts the estimated minutes upward based on energy level and difficulty score
  let multiplier = 1.0;
  if (task.energyRequirement === 'HIGH') multiplier += 0.2;
  if (task.energyRequirement === 'LOW') multiplier -= 0.1;
  
  // Difficulty multiplier: difficulty 10 adds up to 40% buffer
  multiplier += (baseDifficulty - 5.0) * 0.08; 
  
  const predictedCompletionMinutes = Math.max(5, Math.round(task.estimatedTime * Math.max(0.7, multiplier)));

  // 4. Recommended Start Time
  let recommendedStartTime = 'Today 2:00 PM';
  if (diffHours <= 0) {
    recommendedStartTime = 'IMMEDIATELY';
  } else if (diffHours <= 4) {
    recommendedStartTime = 'IMMEDIATELY (High Risk)';
  } else if (diffHours <= 12) {
    recommendedStartTime = `Today within ${Math.ceil(diffHours - 2)} hours`;
  } else if (diffHours <= 24) {
    const startHour = new Date(now.getTime() + (diffHours - 4) * 60 * 60 * 1000);
    recommendedStartTime = `Today at ${startHour.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffHours <= 48) {
    recommendedStartTime = 'Tomorrow Morning';
  } else {
    recommendedStartTime = 'Within 48 hours';
  }

  // 5. Deadline Risk (0-100)
  const isOverdue = diffMs < 0 && task.status !== TaskStatus.COMPLETED;
  let riskScore = 0;
  if (isOverdue) {
    riskScore = 100;
  } else {
    // Risk increases if remaining hours are small compared to predicted completion time
    const remainingMinutes = diffHours * 60;
    const bufferRatio = remainingMinutes / (predictedCompletionMinutes || 1);
    
    if (bufferRatio <= 1.0) {
      riskScore = 90 + (1.0 - bufferRatio) * 10;
    } else if (bufferRatio <= 3.0) {
      riskScore = 50 + (3.0 - bufferRatio) * 20; // 50 - 90
    } else if (bufferRatio <= 10.0) {
      riskScore = 15 + (10.0 - bufferRatio) * 5; // 15 - 50
    } else {
      riskScore = 10;
    }
  }
  riskScore = Math.min(100, Math.max(1, Math.round(riskScore)));

  let level: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let neonGlow = 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
  if (riskScore >= 75) {
    level = 'CRITICAL';
    badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
    neonGlow = 'shadow-[0_0_15px_rgba(239,68,68,0.25)]';
  } else if (riskScore >= 40) {
    level = 'WARNING';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    neonGlow = 'shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  }

  // 6. Recovery Suggestion
  let recoverySuggestion = 'Keep pace. Secure peak block to finalize.';
  if (isOverdue) {
    recoverySuggestion = 'Overdue. Disconnect external channels and trigger Panic Mode now.';
  } else if (riskScore >= 80) {
    recoverySuggestion = 'High Deadline Risk! Deploy immediate isolated Pomodoro block.';
  } else if (baseDifficulty >= 8.0) {
    recoverySuggestion = 'Cognitive load heavy. Extract subtasks and execute step 1 first.';
  } else if (task.energyRequirement === 'HIGH') {
    recoverySuggestion = 'High-energy demand. Lock in first focus hour before fatigue peaks.';
  } else if (task.priority === TaskPriority.CRITICAL) {
    recoverySuggestion = 'Top objective. Anchor in current calendar view and start timer.';
  }

  return {
    urgencyScore,
    importanceScore,
    predictedCompletionMinutes,
    recommendedStartTime,
    deadlineRisk: {
      score: riskScore,
      level,
      badgeColor,
      neonGlow
    },
    recoverySuggestion
  };
}

/**
 * Categorizes task list into our five board lanes: Inbox, Today, This Week, Completed, Overdue.
 */
export function categorizeTasksIntoBoardLanes(tasks: Task[]) {
  const lanes = {
    inbox: [] as Task[],
    today: [] as Task[],
    thisWeek: [] as Task[],
    completed: [] as Task[],
    overdue: [] as Task[]
  };

  const now = new Date();
  
  // Set start and end of today / this week
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(startOfToday);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(startOfToday.getDate() + 7);

  tasks.forEach(task => {
    // Completed goes directly into Completed lane
    if (task.status === TaskStatus.COMPLETED) {
      lanes.completed.push(task);
      return;
    }

    const deadline = new Date(task.deadline);
    const diffMs = deadline.getTime() - now.getTime();

    // Check Overdue first
    if (diffMs < 0) {
      lanes.overdue.push(task);
      return;
    }

    // Check Today
    if (deadline >= startOfToday && deadline <= endOfToday) {
      lanes.today.push(task);
    } 
    // Check This Week (within next 7 days)
    else if (deadline > endOfToday && deadline <= endOfWeek) {
      lanes.thisWeek.push(task);
    } 
    // Others go to Inbox
    else {
      lanes.inbox.push(task);
    }
  });

  return lanes;
}
