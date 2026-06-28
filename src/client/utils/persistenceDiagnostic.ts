/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTaskStore } from '../store/task.store';
import { useFocusStore } from '../store/focus.store';
import { useAuthStore } from '../store/auth.store';

export interface TestStepResult {
  id: string;
  label: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  details: string;
}

/**
 * Runs a simulated diagnostic of the persistence layer to verify that:
 * 1. Creating a task writes to storage and would survive a reload.
 * 2. Starting a focus session writes to storage and would survive a reload.
 * 3. Profile analytics and settings write to storage and would survive a reload.
 */
export async function runPersistenceTests(
  onUpdate: (steps: TestStepResult[]) => void
): Promise<void> {
  const steps: TestStepResult[] = [
    {
      id: 'task-test',
      label: 'Create Task ➔ Refresh ➔ Task Still Exists',
      description: 'Programmatically adds a test task and verifies its serializability under the "deadlinezero-tasks" storage key.',
      status: 'running',
      details: 'Initializing test...',
    },
    {
      id: 'focus-test',
      label: 'Start Focus Session ➔ Refresh ➔ Session Restored',
      description: 'Simulates starting a Pomodoro session and checks if active timer and sound states are safely serialized.',
      status: 'idle',
      details: 'Waiting...',
    },
    {
      id: 'analytics-test',
      label: 'Analytics Generated ➔ Refresh ➔ Analytics Preserved',
      description: 'Updates a productivity milestone and ensures the profile streak and scores are persisted safely.',
      status: 'idle',
      details: 'Waiting...',
    },
  ];

  // Trigger initial UI update
  onUpdate([...steps]);

  // Small artificial delay to show "running" state
  await new Promise((resolve) => setTimeout(resolve, 600));

  // ==========================================
  // TEST 1: Task Creation Persistence
  // ==========================================
  try {
    const taskStoreKey = 'deadlinezero-tasks';
    const testTitle = `AUTO_TEST_TASK_${Date.now()}`;
    
    // Add the test task
    useTaskStore.getState().addTask({
      title: testTitle,
      description: 'Automated persistence verification task.',
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: 'high' as any,
      status: 'pending' as any,
      userId: "diagnostic-test",
      estimatedTime: 45,
    });

    // Check localStorage content
    const serializedData = window.localStorage.getItem(taskStoreKey);
    if (!serializedData) {
      throw new Error(`No data found in localStorage under key: "${taskStoreKey}"`);
    }

    const parsed = JSON.parse(serializedData);
    const savedTasks = parsed.state?.tasks || [];
    const foundTask = savedTasks.find((t: any) => t.title === testTitle);

    if (!foundTask) {
      throw new Error(`Test task "${testTitle}" was not serialized into localStorage`);
    }

    // Success! Let's clean up that test task
    useTaskStore.getState().deleteTask(foundTask.id);

    steps[0] = {
      ...steps[0],
      status: 'passed',
      details: `SUCCESS: Task successfully serialized, verified in localStorage key "${taskStoreKey}", and cleaned up.`,
    };
  } catch (error: any) {
    steps[0] = {
      ...steps[0],
      status: 'failed',
      details: `FAILED: Task persistence test failed: ${error.message}`,
    };
  }

  steps[1].status = 'running';
  steps[1].details = 'Initializing focus room test...';
  onUpdate([...steps]);
  await new Promise((resolve) => setTimeout(resolve, 600));

  // ==========================================
  // TEST 2: Focus Session Persistence
  // ==========================================
  try {
    const focusStoreKey = 'deadlinezero-focus';
    
    // Backup current focus state
    const originalTaskId = useFocusStore.getState().activeTaskId;
    const originalTaskTitle = useFocusStore.getState().activeTaskTitle;
    const originalIsRunning = useFocusStore.getState().isRunning;
    const originalAmbientSound = useFocusStore.getState().ambientSound;

    // Simulate focus start
    const testTaskId = `t-test-${Date.now()}`;
    const testTaskTitle = 'Verify Persistence Layers';
    useFocusStore.getState().linkTask(testTaskId, testTaskTitle);
    useFocusStore.getState().startTimer();
    useFocusStore.getState().setAmbientSound('synth');

    // Check localStorage content
    const serializedFocus = window.localStorage.getItem(focusStoreKey);
    if (!serializedFocus) {
      throw new Error(`No focus data found in localStorage under "${focusStoreKey}"`);
    }

    const parsedFocus = JSON.parse(serializedFocus);
    const state = parsedFocus.state;

    if (
      state.activeTaskId !== testTaskId ||
      state.activeTaskTitle !== testTaskTitle ||
      state.isRunning !== true ||
      state.ambientSound !== 'synth'
    ) {
      throw new Error('Focus state mismatch in serialized localStorage payload');
    }

    // Restore original focus state
    useFocusStore.getState().linkTask(originalTaskId, originalTaskTitle);
    if (originalIsRunning) {
      useFocusStore.getState().startTimer();
    } else {
      useFocusStore.getState().pauseTimer();
    }
    useFocusStore.getState().setAmbientSound(originalAmbientSound);

    steps[1] = {
      ...steps[1],
      status: 'passed',
      details: `SUCCESS: Active focus session (linked to: "${testTaskTitle}", ambient sound: "synth") verified in localStorage, and original state successfully restored.`,
    };
  } catch (error: any) {
    steps[1] = {
      ...steps[1],
      status: 'failed',
      details: `FAILED: Focus session persistence test failed: ${error.message}`,
    };
  }

  steps[2].status = 'running';
  steps[2].details = 'Initializing analytics verification...';
  onUpdate([...steps]);
  await new Promise((resolve) => setTimeout(resolve, 600));

  // ==========================================
  // TEST 3: Analytics & Profile Persistence
  // ==========================================
  try {
    const authStoreKey = 'deadlinezero-auth';

    // Backup current score
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('No active user profile loaded to run analytics test.');
    }

    const originalScore = user.productivityScore;
    const testScoreValue = Math.min(100, originalScore + 1);

    // Update profile score
    useAuthStore.getState().updateProfile({ productivityScore: testScoreValue });

    // Verify in localStorage
    const serializedAuth = window.localStorage.getItem(authStoreKey);
    if (!serializedAuth) {
      throw new Error(`No profile data found in localStorage under "${authStoreKey}"`);
    }

    const parsedAuth = JSON.parse(serializedAuth);
    const savedUser = parsedAuth.state?.user;

    if (!savedUser || savedUser.productivityScore !== testScoreValue) {
      throw new Error('Productivity score failed to serialize into storage');
    }

    // Restore original score
    useAuthStore.getState().updateProfile({ productivityScore: originalScore });

    steps[2] = {
      ...steps[2],
      status: 'passed',
      details: `SUCCESS: Profile analytics (Productivity Score: ${testScoreValue}%) successfully written, verified in localStorage, and cleaned up.`,
    };
  } catch (error: any) {
    steps[2] = {
      ...steps[2],
      status: 'failed',
      details: `FAILED: Analytics persistence test failed: ${error.message}`,
    };
  }

  onUpdate([...steps]);
}
