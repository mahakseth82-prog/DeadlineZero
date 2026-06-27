# DeadlineZero - Hackathon MVP Architecture Document

**Version:** 2.0 (Hackathon Edition)  
**Author:** Senior Solution Architect  
**Project:** DeadlineZero (AI-Powered Productivity Agent)  

---

## 1. System Topology & Data Flow

DeadlineZero is structured as a full-stack web application optimized for ultra-fast, low-latency dashboard loads, interactive focus mechanics, and real-time AI triage feedback.

```text
                                  +------------------------------------+
                                  |         React Frontend SPA         |
                                  |   (Tailwind, Zustand, React Query) |
                                  +-----------------+------------------+
                                                    |
                                                    | (REST / Multipart HTTP)
                                                    v
                                  +-----------------+------------------+
                                  |       Express.js API Gateway       |
                                  |      (Middlewares, Controllers)    |
                                  +--------+--------+--------+---------+
                                           |        |        |
                         (Prisma Client)   |        |        | (Stream Pipe)
                                           v        |        v
                   +-----------------------+--+     |    +---+-----------------+
                   |  PostgreSQL Database  |     |    | Cloudinary Storage  |
                   +--------------------------+     |    +---------------------+
                                                    |
                                                    | (@google/genai SDK)
                                                    v
                                  +-----------------+------------------+
                                  |        Google Gemini API           |
                                  |        (gemini-2.5-flash)          |
                                  +------------------------------------+
```

---

## 2. Frontend Architecture & Design Patterns

The frontend is a single-page application built on React, TypeScript, and Vite. It isolates highly interactive, ephemeral UI state (Zustand) from canonical, remote server state (React Query).

### 2.1 State Demarcation Strategy
- **Transient State (Zustand)**: Used strictly for high-frequency interactive events, such as ticking timers, current media playback states, slide-out drawer transitions, and active speech recognition recording queues.
- **Durable Server State (React Query)**: Used for task collections, user profile documents, and calendar schedules. Handles automated retries, caching policies (5-minute stale-time default), and optimistic UI updates for task completions.

### 2.2 Component Sizing & Styling Principles
- **Design Token Integration**: Styled using Tailwind CSS v4, drawing from custom-defined spacing and layout variables.
- **Micro-Animations**: Framer Motion handles route transitions, dashboard widget updates, and progress-bar expansion sequences.
- **Responsive Fluidity**: Follows mobile-first breakpoints (`sm`, `md`, `lg`, `xl`) capped at a maximum layout width of `1280px` (`max-w-7xl`) to maintain visual density on wider screens.

---

## 3. Backend Architecture (Express.js Gateway)

The server runs on Node.js using Express.js. It follows a clean, single-responsibility, multi-tiered structure to insulate routing from business and database computations.

```text
[ Client Requests ]
        │
        ▼
[ Route Middleware ] ──► (Authentication, Rate-Limiting, Payload Schema Validation)
        │
        ▼
[ Controllers ] ───────► (Parse HTTP params, map status codes, format envelope)
        │
        ▼
[ Services ] ──────────► (Core business algorithms, Transaction boundaries, AI prompts)
        │
        ▼
[ Data Access / DB ] ──► (Prisma ORM PostgreSQL communication)
```

### 3.1 Layer Separation Rules
1. **Middlewares**: Secure raw paths. Reject requests immediately if access tokens are missing/malformed, or if requests violate rate limits (particularly AI coaching routes).
2. **Controllers**: Act as HTTP transport translators. They do not contain SQL, Prisma calls, or prompt generation logic. They parse requests, pass parsed data to services, and format replies.
3. **Services**: Ground-truth domain modules. Contain all data transformation logic, external storage interactions, and execution of transactional write-locks.

---

## 4. Route Structure & Page Hierarchy

### 4.1 Client-Side Page Router (React Router DOM)

```text
/ (Root)
├── /landing                        - Marketing Homepage, Features, Pricing (Public)
├── /login                          - Authentication Portal (Public)
├── /signup                         - Account Creation (Public)
└── /app (Protected Layout Wrapper)
    ├── /dashboard                  - Command Center (Task Feed, Risk Alerts, Stats)
    ├── /onboarding                 - Productivity profile builder & goal mapping
    ├── /tasks                      - Master Task list & Kanban view
    ├── /calendar                   - Daily / Weekly drag-and-drop planning grid
    ├── /focus-room                 - Pomodoro countdown canvas, ambient loops
    ├── /panic-mode                 - Manual panic activation, emergency countdown, recovery roadmap
    ├── /coach                      - AI chat sidebar and actionable workflow cards
    ├── /analytics                  - Task metrics, focus trends, and historical timelines
    └── /settings                   - Profile configurations, notifications preferences, themes
```

### 4.2 Backend REST API Spec

#### /api/auth
- `POST   /api/auth/signup`         - Create user account and trigger verification
- `POST   /api/auth/login`          - Verify credentials, set Http-Only Refresh cookie, return Access JWT
- `POST   /api/auth/logout`         - Revoke active tokens, clear client session cookies
- `POST   /api/auth/refresh`        - Rotate active access tokens via valid refresh token

#### /api/tasks
- `GET    /api/tasks`               - Fetch all tasks for active session user (supports filter options)
- `POST   /api/tasks`               - Create task and trigger automated AI triage
- `GET    /api/tasks/:id`           - Retrieve single task with subtasks and risk prediction records
- `PUT    /api/tasks/:id`           - Update task fields and recalculate AI priority parameters
- `DELETE /api/tasks/:id`           - Remove task, associated calendar schedules, and dependencies

#### /api/calendar
- `GET    /api/calendar`            - Fetch scheduled calendar blocks within a specific time range
- `POST   /api/calendar/schedule`   - Auto-allocate time blocks on the calendar for selected tasks via AI

#### /api/focus
- `POST   /api/focus/start`         - Log initiation of Pomodoro focus timer linked to a task
- `POST   /api/focus/end`           - Log focus session duration, productivity inputs, and update profile metrics

#### /api/panic
- `POST   /api/panic/trigger`       - Initiate emergency recovery mode for highly complex, at-risk tasks
- `GET    /api/panic/plan/:id`      - Fetch active AI-generated emergency sprint checklist
- `POST   /api/panic/resolve`       - Conclude panic session and document recovery success indicators

#### /api/coach
- `POST   /api/coach/chat`          - Send user messages with profile payload to return contextual advice

#### /api/analytics
- `GET    /api/analytics/dashboard` - Compile completed counts, focus hours, and weekly metrics

---

## 5. Component & Feature Hierarchy

Frontend views are isolated into domain-centric feature folders containing views, hooks, and local presentational modules.

```text
App (Global context providers, Theme wrapper, QueryClientProvider)
│
└── AppLayout (Universal Header, collapsible Sidebar navigation)
    │
    ├── DashboardView (Main Page)
    │   ├── TodayTasksWidget (List of prioritised tasks)
    │   ├── RiskOverviewWidget (High-risk items flagged)
    │   ├── ProductivityScoreRing (Interactive radial metric)
    │   └── AiRecommendationCard (Action-oriented coach snippets)
    │
    ├── TaskManagementView
    │   ├── TaskKanbanBoard (Drag-and-drop workflow lanes)
    │   ├── TaskListContainer (Compact, sorted, searchable matrix)
    │   │   └── TaskRow (Visual status checkbox, urgency tag)
    │   └── TaskEditorDrawer (Creates / updates task, categories, priority, and subtasks)
    │
    ├── FocusRoomView
    │   ├── PomodoroTimer (Centered ring with Framer-Motion countdown animation)
    │   ├── SoundControlConsole (Toggle grid for rain, brown noise, or synthesizer loops)
    │   └── ActiveTaskBanner (Displays active target, description, and dependency alert)
    │
    └── PanicModeView (Emergency State)
        ├── MasterCountdownTimer (Large countdown showing minutes remaining to milestone)
        ├── DynamicRecoveryChecklist (AI-generated hierarchical steps to completion)
        ├── BurnoutPreemptionCard (Coaching advice for stress management)
        └── PanicSuccessTrigger (Big button to clear panic state and earn extra recovery XP)
```

---

## 6. Store Architecture & React Query Topography

### 6.1 Zustand Store Subsystems

```typescript
// Authentication Store Schema
interface AuthStore {
  accessToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: UserProfile) => void;
  clearSession: () => void;
}

// Focus State Store Schema (Pomodoro Timer)
interface FocusStore {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  activeTaskId: string | null;
  ambientSoundType: 'none' | 'rain' | 'white' | 'synth';
  isAudioPlaying: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  tick: () => void;
  setAudioType: (type: 'none' | 'rain' | 'white' | 'synth') => void;
  resetTimer: () => void;
}

// Panic Mode Store Schema
interface PanicStore {
  isActive: boolean;
  criticalTaskId: string | null;
  panicTimeRemaining: number;
  activeRecoveryPlan: string[] | null;
  triggerPanic: (taskId: string, plan: string[]) => void;
  dismissPanic: () => void;
  tickPanicTimer: () => void;
}
```

### 6.2 React Query Query Key Hierarchy
React Query manages asynchronous data using standard query-key patterns to enable clean invalidation hooks:

- **Tasks**: `['tasks', 'list', { status: 'TODO' }]`, `['tasks', 'detail', taskId]`
- **Calendar**: `['calendar', 'events', { start: '2026-06-24', end: '2026-07-01' }]`
- **User Settings**: `['user', 'profile']`
- **Analytics**: `['analytics', 'metrics', 'weekly']`

---

## 7. AI Service Layer & Integration (Google Gemini API)

All AI interactions leverage the `@google/genai` SDK on the server, enforcing strong type constraints, validation guards, and low-latency structured output schemas.

```text
                               Context Gathering
                                       │
     ┌─────────────────────────────────┼────────────────────────────────┐
     ▼                                 ▼                                ▼
Active Task Payload            User Profile Metadata            Workload Capacity Metrics
     │                                 │                                │
     └─────────────────────────────────┼────────────────────────────────┘
                                       │
                                       ▼
                              Prompt Synthesis
                                       │
                                       ▼
                            Google Gemini API Client
                             (gemini-2.5-flash)
                                       │
                                       ▼
                       Structured JSON Response Validator
```

### 7.1 System Prompt Strategies
1. **AI Triage Prompt**: Instructs the model to evaluate the difficulty of a task alongside the user's workload, occupation, and timeline to return a structured JSON response containing:
   - `riskScore` (0 to 100)
   - `riskLevel` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `NONE`)
   - `explanation` (A maximum of two sentences explaining the prioritization, without technical jargon)
2. **Panic Plan Prompt**: Synthesizes a granular roadmap for highly at-risk tasks, breaking down complex objectives into sequential subtasks of 30-minute blocks, incorporating built-in rest periods.

---

## 8. Operational & Integration Flows

### 8.1 Dual-Token Authentication Flow
DeadlineZero employs secure HTTP-Only cookies to protect against XSS and CSRF:
- **Initialization**: Upon a successful login/signup, the API Gateway returns:
  - An **Access Token** in the JSON response body, cached strictly in frontend memory (`authStore`).
  - A **Refresh Token** configured as an `HTTP-Only`, `Secure`, `SameSite=Strict` cookie.
- **Silent Re-authentication**: Standard Axios/Fetch wrappers intercept HTTP `401 Unauthorized` responses. If expired, the wrapper calls the `/api/auth/refresh` endpoint in the background to seamlessly rotate credentials without user interruption.

### 8.2 Multipart File Upload Pipeline
File attachments (such as study materials or assignment guidelines) leverage a secure stream pipeline:
- **Client Handling**: The drag-and-drop canvas handles files up to 10MB, converting files to a Multipart Form data object.
- **Server Interception**: An Express route interceptor receives the payload, processes the byte stream in-memory, and pipes it directly to Cloudinary.
- **DB Resolution**: Once Cloudinary validates the file upload, the metadata (secure URL, size, name) is written to the database and linked to the corresponding task using Prisma.

### 8.3 Unidirectional Data Flow Diagram
Data flows unidirectionally, utilizing React Query as the single source of truth for the frontend UI.

```text
[ User Action: Mark Subtask Complete ]
                 │
                 ▼
[ Local Frontend State Update ] ──► (React state or Zustand updates toggle visual state instantly)
                 │
                 ▼
[ React Query Mutation Trigger ] ─► (Dispatches PUT request to `/api/tasks/:id`)
                 │
                 ▼
[ Express API Route Handler ] ───► (Validates token, processes subtask complete in PostgreSQL)
                 │
                 ▼
[ Database Cascade Rules ] ──────► (Prisma update triggers completion and schedules DB write)
                 │
                 ▼
[ React Query Cache Invalidate ] ─► (Invalidates ['tasks'] key, fetching fresh state in background)
```
---
This completes the architecture outline for the 4-day Hackathon MVP, balancing simplicity, clear modular boundaries, and performance.
