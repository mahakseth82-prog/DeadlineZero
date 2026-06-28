import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Check and initialize Gemini API Client safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('WARNING: GEMINI_API_KEY is not defined in the environment.');
  }

  // API Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', apiInitialized: !!ai });
  });

  // POST /api/ai/coach
  app.post('/api/ai/coach', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Gemini API client is not initialized. Please verify that GEMINI_API_KEY is configured in your secrets panel.',
        });
      }

      const { prompt, tasks = [], focusStats = {}, panicLogs = [] } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'A prompt is required.' });
      }

      // Format current timestamp for temporal context
      const currentTimestamp = new Date().toISOString();

      // Synthesize prompt context containing tasks, priority levels, risk metrics, focus logs, and user's query
      const contextMessage = `
Current time: ${currentTimestamp}

USER DIRECTIVE / PROMPT:
"${prompt}"

USER CURRENT STATE:
Tasks Backlog:
${JSON.stringify(tasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  priority: t.priority,
  status: t.status,
  estimatedTime: t.estimatedTime,
  deadline: t.deadline,
  category: t.category?.name || 'General',
  riskScore: t.riskScore || 0,
  subtasksCount: t.subtasks?.length || 0,
  subtasksCompleted: t.subtasks?.filter((s: any) => s.completed).length || 0
})), null, 2)}

Focus Statistics:
- Completed Pomodoro Loops Today: ${focusStats.completedLoopsCount || 0}
- Total Deep Focus Time: ${focusStats.totalFocusMinutes || 0} minutes (${((focusStats.totalFocusMinutes || 0) / 60).toFixed(1)} hours)
- Current Daily Active Streak: ${focusStats.activeStreak || 0} Days

Panic Room Logs (Emergency Sprints):
- Total Recoveries Completed: ${panicLogs.length}
- Completed Sprint Logs: ${JSON.stringify(panicLogs.map((p: any) => ({ taskTitle: p.taskTitle, completedAt: p.completedAt })))}
`;

      const systemInstruction = `You are a Senior AI Productivity Coach and Expert Coordinator for 'DeadlineZero', an elite offline-first focus sprint dashboard.
Your goal is to provide highly precise, actionable, and hyper-contextual scheduling strategies and task prioritization, strictly grounded in the user's live productivity metrics, backlog task loads, priorities, risk scores, and focus histories.

Always return a structured JSON response matching the requested schema. Ensure the recommendations are encouraging but highly focused on preventing deadline misses, optimizing focus blocks, and mitigating cognitive burnout. Be direct and realistic. Avoid fluff or ungrounded promises.`;

      // Helper for retrying the Gemini API with exponential backoff
      const generateWithRetry = async (params: any, maxRetries = 3, initialDelay = 1000) => {
        let attempt = 0;
        while (attempt < maxRetries) {
          try {
            return await ai!.models.generateContent(params);
          } catch (error: any) {
            attempt++;
            const errorMessage = error.message || '';
            const errorStatus = error.status || error.statusCode || 500;
            const isTransient = errorStatus === 429 || errorStatus === 503 ||
                                /429|quota|exhausted|rate|limit|503|unavailable|busy|overloaded|demand/i.test(errorMessage);
            
            if (isTransient && attempt < maxRetries) {
              const delay = initialDelay * Math.pow(2, attempt);
              console.warn(`[AI Coach] Transient Gemini API error (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
        throw new Error('All retry attempts failed.');
      };

      const buildFallbackData = () => {
        const priorityTasks = tasks.slice(0, 3).map((t: any) => ({
          taskId: t.id || '',
          title: t.title || 'Focus Objective',
          priority: t.priority || 'High',
          reason: `Highly urgent task detected in your backlog. Advise allocating immediate Pomodoro blocks for this.`
        }));

        if (priorityTasks.length === 0) {
          priorityTasks.push({
            taskId: '',
            title: 'Define your first priority task',
            priority: 'High',
            reason: 'Identify and break down your primary objective to start your focus sprint.'
          });
        }

        const scheduleSuggestions = [
          {
            timeSlot: '09:00 - 10:30',
            activity: priorityTasks[0]?.title || 'Deep Focus Sprint',
            reason: 'Prime high-energy cognitive block. Focus exclusively on one major deliverable.'
          },
          {
            timeSlot: '11:00 - 12:00',
            activity: 'Secondary Task Execution',
            reason: 'Excellent mid-day block for checklists, subtasks, and minor reviews.'
          }
        ];

        const riskWarnings = tasks
          .filter((t: any) => t.priority === 'CRITICAL' || t.priority === 'HIGH' || (t.riskScore && t.riskScore > 50))
          .slice(0, 2)
          .map((t: any) => ({
            title: t.title || 'Task Delay Risk',
            warning: 'Deadline Pressure Detected',
            riskScore: t.riskScore || 75
          }));

        if (riskWarnings.length === 0) {
          riskWarnings.push({
            title: 'Cognitive Load Triage',
            warning: 'Keep focus sprints bounded to 2-3 tasks max to prevent mental exhaustion.',
            riskScore: 35
          });
        }

        return {
          recommendation: `Offline tactical mode activated. The primary AI service is experiencing heavy load, but I have compiled an offline prioritizer based on your live backlog. Focus on single-task execution, protect your peak energy windows, and execute subtasks sequentially to protect your momentum.`,
          priorityTasks,
          scheduleSuggestions,
          riskWarnings
        };
      };

      // Call the Gemini API with schema constraint
      let parsedData;
      try {
        const response = await generateWithRetry({
          model: 'gemini-3.5-flash',
          contents: contextMessage,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendation: {
                  type: Type.STRING,
                  description: 'The main coaching advice paragraph tailored to the user\'s specific prompt and tasks state.',
                },
                priorityTasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      taskId: { type: Type.STRING, description: 'Optional ID of the associated task if applicable.' },
                      title: { type: Type.STRING, description: 'Title of the task or focus objective.' },
                      priority: { type: Type.STRING, description: 'Urgently assigned priority label.' },
                      reason: { type: Type.STRING, description: 'Brief explanation why this task is prioritized right now.' },
                    },
                    required: ['title', 'priority', 'reason'],
                  },
                  description: 'A curated list of up to 3 highest-priority items the user should tackle next.',
                },
                scheduleSuggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timeSlot: { type: Type.STRING, description: 'Suggested time range format, e.g., "09:00 - 10:30".' },
                      activity: { type: Type.STRING, description: 'What the user should focus on during this block.' },
                      reason: { type: Type.STRING, description: 'Coaching context on why this slot fits.' },
                    },
                    required: ['timeSlot', 'activity', 'reason'],
                  },
                  description: 'Hourly block breakdown optimized around the user\'s fatigue levels and deadline targets.',
                },
                riskWarnings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: 'Name of the risk factor or high-risk task.' },
                      warning: { type: Type.STRING, description: 'Visual explanation of the risk (e.g. "Overdue", "Imminent Miss").' },
                      riskScore: { type: Type.NUMBER, description: 'A calculated numeric risk index between 0 and 100.' },
                    },
                    required: ['title', 'warning', 'riskScore'],
                  },
                  description: 'Alert warnings calling out imminent bottlenecks, overdue milestones, or extreme deadline pressures.',
                },
              },
              required: ['recommendation', 'priorityTasks', 'scheduleSuggestions', 'riskWarnings'],
            },
          },
        });

        const responseText = response?.text;
        if (!responseText) {
          throw new Error('Gemini returned an empty response.');
        }

        parsedData = JSON.parse(responseText.trim());
      } catch (geminiError: any) {
        console.error('[AI Coach] Gemini API error (falling back to dynamic offline layout):', geminiError);
        parsedData = buildFallbackData();
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/ai/coach:', error);
      
      const errorMessage = error.message || '';
      const errorStatus = error.status || error.statusCode || 500;
      
      const isRateLimit = errorStatus === 429 || /429|quota|exhausted|rate|limit/i.test(errorMessage);
      const isUnavailable = errorStatus === 503 || /503|unavailable|busy|overloaded|demand|exhausted/i.test(errorMessage);
      
      if (isRateLimit) {
        res.status(429).json({
          error: 'AI Coach is temporarily busy. Please try again in a few moments.',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      } else if (isUnavailable) {
        res.status(503).json({
          error: 'The AI service is experiencing high demand.',
          code: 'SERVICE_UNAVAILABLE'
        });
      } else {
        res.status(500).json({
          error: 'Unable to generate recommendations right now.',
          code: 'GENERIC_AI_ERROR'
        });
      }
    }
  });

  // POST /api/ai/task-breakdown
  app.post('/api/ai/task-breakdown', async (req, res) => {
    try {
      const { taskTitle, taskDescription = '' } = req.body;
      if (!taskTitle) {
        return res.status(400).json({ error: 'Task title is required.' });
      }

      if (!ai) {
        // Fallback generator
        const steps = [
          `Review scope of ${taskTitle}`,
          `Establish development roadmap for ${taskTitle}`,
          `Draft core layout and UI elements`,
          `Integrate state engines and storage keys`,
          `Perform strict system diagnostic reviews`
        ];
        return res.json({ subtasks: steps });
      }

      const prompt = `Break down the task titled "${taskTitle}" (Description: "${taskDescription}") into a list of 4-6 specific, actionable, granular steps. Return a JSON array of strings containing just the subtask titles.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AI task assistant. Return a JSON object with a key "subtasks" containing an array of 4-6 strings representing granular actionable subtasks.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 4-6 subtasks to break down the user task.',
              },
            },
            required: ['subtasks'],
          },
        },
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return res.json(parsed);
      } else {
        throw new Error('Empty response from model');
      }
    } catch (err: any) {
      console.error('Error breaking down task:', err);
      res.json({
        subtasks: [
          `Deconstruct core requirements`,
          `Analyze boundary inputs and parameters`,
          `Draft primary structure and layout`,
          `Configure event hooks and storage layers`,
          `Verify final compliance benchmarks`
        ]
      });
    }
  });

  // POST /api/ai/voice-parse
  app.post('/api/ai/voice-parse', async (req, res) => {
    try {
      const { voiceText } = req.body;
      if (!voiceText) {
        return res.status(400).json({ error: 'voiceText is required.' });
      }

      const currentTimestamp = new Date().toISOString();

      if (!ai) {
        const lower = voiceText.toLowerCase();
        let priority = 'MEDIUM';
        if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) priority = 'CRITICAL';
        else if (lower.includes('important') || lower.includes('high')) priority = 'HIGH';
        else if (lower.includes('low') || lower.includes('easy')) priority = 'LOW';

        let estTime = 60;
        if (lower.includes('hour')) estTime = 120;
        else if (lower.includes('minute') || lower.includes('min')) {
          const match = lower.match(/(\d+)\s*(min|minute)/);
          if (match) estTime = parseInt(match[1], 10);
        }

        const fallbackData = {
          title: voiceText.substring(0, 50) || 'New AI Audio Task',
          description: `Extracted from vocal command: "${voiceText}"`,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority,
          estimatedTime: estTime,
          categoryName: 'General',
          difficultyScore: priority === 'CRITICAL' ? 8.0 : priority === 'HIGH' ? 6.5 : 4.0,
          energyRequirement: priority === 'CRITICAL' || priority === 'HIGH' ? 'HIGH' : 'MEDIUM'
        };
        return res.json(fallbackData);
      }

      const prompt = `Extract structured task properties from the spoken voice command: "${voiceText}". Current local time is ${currentTimestamp}. Ensure the deadline is returned as an ISO datetime string calculated relative to this timestamp (for example, if the voice says "by 8pm today", calculate today's date with 20:00 hours).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert voice command task parser. Extract the task details into a structured JSON response matching the provided schema. For the deadline, always output a future ISO 8601 string calculated relative to the provided current local time. For priority, choose one of: LOW, MEDIUM, HIGH, CRITICAL. For energyRequirement, choose one of: LOW, MEDIUM, HIGH.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Direct clear title of the task.' },
              description: { type: Type.STRING, description: 'Slightly detailed description of the task based on context.' },
              deadline: { type: Type.STRING, description: 'Calculated target deadline date-time as an ISO string.' },
              priority: { type: Type.STRING, description: 'The priority level: LOW, MEDIUM, HIGH, or CRITICAL.' },
              estimatedTime: { type: Type.INTEGER, description: 'Estimated effort time in minutes.' },
              categoryName: { type: Type.STRING, description: 'An appropriate category tag, e.g., Academic, Work, Personal, Health, Project, Assignment.' },
              difficultyScore: { type: Type.NUMBER, description: 'AI estimated difficulty rating from 1.0 to 10.0.' },
              energyRequirement: { type: Type.STRING, description: 'Energy level: LOW, MEDIUM, or HIGH.' }
            },
            required: ['title', 'description', 'deadline', 'priority', 'estimatedTime', 'categoryName', 'difficultyScore', 'energyRequirement']
          }
        }
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return res.json(parsed);
      } else {
        throw new Error('Empty voice parse response');
      }
    } catch (err: any) {
      console.error('Error parsing voice task:', err);
      const fallbackText = req.body.voiceText || 'New Voice Command Task';
      res.json({
        title: fallbackText.substring(0, 55),
        description: `Voice Command fallback parsing. Raw input: "${fallbackText}"`,
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        estimatedTime: 45,
        categoryName: 'Other',
        difficultyScore: 5.0,
        energyRequirement: 'MEDIUM'
      });
    }
  });

  // Vite dev middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
  });
}

startServer();
