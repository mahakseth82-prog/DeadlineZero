/**
 * Automated Unit Test Suite for DeadlineZero Triage Engine
 * Tests risk calculation, mathematical capacity checks, and priority urgency scoring.
 */

import { calculateTaskRisk } from '../src/client/utils/triage';
import { Task, TaskPriority, TaskStatus, RiskLevel } from '../src/types';

function runTests() {
  console.log('🧪 Starting DeadlineZero Triage Engine Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
      failed++;
    }
  }

  const baseTask: Task = {
    id: 'test-1',
    userId: 'u-1',
    title: 'Finalize Architecture Document',
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    estimatedTime: 60,
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Test 1: Completed task must always have 0 risk
  {
    const completedTask: Task = {
      ...baseTask,
      status: TaskStatus.COMPLETED,
    };
    const triage = calculateTaskRisk(completedTask, [completedTask]);
    assert(
      triage.riskScore === 0 && triage.riskLevel === RiskLevel.LOW && !triage.isOverdue,
      'Completed tasks evaluate to 0 risk score and LOW risk level'
    );
  }

  // Test 2: Overdue task must have riskScore 100 and isOverdue true
  {
    const overdueTask: Task = {
      ...baseTask,
      deadline: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      status: TaskStatus.TODO,
    };
    const triage = calculateTaskRisk(overdueTask, [overdueTask]);
    assert(
      triage.riskScore === 100 && triage.riskLevel === RiskLevel.CRITICAL && triage.isOverdue,
      'Overdue task evaluates to 100 risk score and CRITICAL risk level'
    );
  }

  // Test 3: Imminent Critical Task (< 6 hours, CRITICAL priority) must clamp to >= 92 risk
  {
    const criticalTask: Task = {
      ...baseTask,
      deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours from now
      priority: TaskPriority.CRITICAL,
      status: TaskStatus.IN_PROGRESS,
      estimatedTime: 90,
    };
    const triage = calculateTaskRisk(criticalTask, [criticalTask]);
    assert(
      triage.riskScore >= 92 && triage.riskLevel === RiskLevel.CRITICAL,
      'Imminent critical task (< 6 hours) clamps to >= 92 risk score',
      `Got score ${triage.riskScore}`
    );
  }

  // Test 4: Mathematical Overload (required time > available time) triggers capacity alert
  {
    const overloadedTask: Task = {
      ...baseTask,
      deadline: new Date(Date.now() + 1 * 3600 * 1000).toISOString(), // 1 hour left
      estimatedTime: 180, // 3 hours required!
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    };
    const triage = calculateTaskRisk(overloadedTask, [overloadedTask]);
    assert(
      triage.recommendation.includes('CRITICAL CAPACITY ALERT'),
      'Workload density > 1.0 triggers CRITICAL CAPACITY ALERT in recommendation',
      triage.recommendation
    );
  }

  // Test 5: Safe distant task (> 7 days, LOW priority) must evaluate to LOW risk
  {
    const farFutureTask: Task = {
      ...baseTask,
      deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(), // 10 days
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      estimatedTime: 30,
    };
    const triage = calculateTaskRisk(farFutureTask, [farFutureTask]);
    assert(
      triage.riskLevel === RiskLevel.LOW && triage.riskScore <= 35,
      'Safe distant task evaluates to LOW risk level',
      `Got score: ${triage.riskScore}, level: ${triage.riskLevel}`
    );
  }

  // Test 6: Workload congestion from multiple incomplete tasks elevates risk
  {
    const currentTask: Task = {
      ...baseTask,
      deadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    };
    const heavyCongestionBacklog: Task[] = [
      currentTask,
      { ...baseTask, id: 'c-1', estimatedTime: 300, status: TaskStatus.TODO },
      { ...baseTask, id: 'c-2', estimatedTime: 300, status: TaskStatus.TODO },
      { ...baseTask, id: 'c-3', estimatedTime: 300, status: TaskStatus.TODO },
    ];
    const isolatedTriage = calculateTaskRisk(currentTask, [currentTask]);
    const congestedTriage = calculateTaskRisk(currentTask, heavyCongestionBacklog);
    assert(
      congestedTriage.riskScore > isolatedTriage.riskScore,
      'Heavy backlog congestion correctly increases risk score points',
      `Isolated: ${isolatedTriage.riskScore}, Congested: ${congestedTriage.riskScore}`
    );
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All triage engine tests verified successfully!\n');
  }
}

runTests();
