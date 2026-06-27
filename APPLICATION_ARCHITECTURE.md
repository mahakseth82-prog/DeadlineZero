# DeadlineZero - Application Architecture Document

**Version:** 1.0  
**Author:** Senior Product Architect  
**Project:** DeadlineZero (AI-Powered Productivity Agent)  

---

## 1. Directory Structure

Below is the production-ready directory tree for the entire full-stack monorepo, showing clear boundaries, separation of concerns, and clean architectural alignment.

```text
deadlinezero/
├── .env.example                     # Environment variable blueprints
├── .gitignore                       # Ignored file patterns
├── index.html                       # SPA Root HTML entry-point
├── metadata.json                    # Application metadata & permissions config
├── package.json                     # Monorepo dependencies & script orchestration
├── tsconfig.json                    # Root TypeScript configuration
├── vite.config.ts                   # Vite compiler pipeline & dev proxy rules
│
├── prisma/                          # Database Definition Folder
│   └── schema.prisma                # Finalized Prisma DB models, indices, and relationships
│
├── src/                             # Core Application Code
│   ├── main.tsx                     # React client-side bootstrap entry-point
│   ├── index.css                    # Tailwind CSS base styling & custom tokens
│   ├── types.ts                     # Unified shared TypeScript models & types
│   │
│   ├── server/                      # Express Backend Layer
│   │   ├── index.ts                 # Express core application entry-point
│   │   ├── config.ts                # Environment configurations (Gemini, JWT, Postgres)
│   │   │
│   │   ├── controllers/             # Express Route Handlers (Request parsing, state validation)
│   │   │   ├── auth.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── calendar.controller.ts
│   │   │   ├── focus.controller.ts
│   │   │   ├── triage.controller.ts
│   │   │   └── coach.controller.ts
│   │   │
│   │   ├── routes/                  # Express Router Mappings
│   │   │   ├── auth.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── calendar.routes.ts
│   │   │   ├── focus.routes.ts
│   │   │   ├── triage.routes.ts
│   │   │   ├── coach.routes.ts
│   │   │   └── index.ts             # Global router bundle (/api)
│   │   │
│   │   ├── middlewares/             # Request Interceptors
│   │   │   ├── auth.middleware.ts   # JWT / OAuth validation and session checks
│   │   │   ├── error.middleware.ts  # Centralized exception logging and JSON formatting
│   │   │   └── rate-limit.ts        # Route-level rate limiting (especially AI routes)
│   │   │
│   │   └── services/                # Heavy Business Logic & Third-Party Integrations
│   │       ├── db.service.ts        # Prisma Client instantiation with active connections
│   │       ├── gemini.service.ts    # Server-Side Google Gen AI (@google/genai SDK)
│   │       ├── task-triage.service.ts # AI risk prediction algorithms
│   │       ├── automation.service.ts  # Overdue task sweeps & active scheduler agent
│   │       ├── storage.service.ts   # Cloudinary stream upload handlers
│   │       └── notify.service.ts    # SSE (Server-Sent Events) dispatch hub
│   │
│   └── client/                      # React Frontend SPA Layer
│       ├── components/              # Reusable UI Controls (Presentational / Dumb Components)
│       │   ├── ui/                  # Shadcn primitive design system blocks
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Dialog.tsx
│       │   ├── charts/              # Recharts analytical components
│       │   │   ├── ProductivityTrend.tsx
│       │   │   └── FocusMetrics.tsx
│       │   └── layout/              # Structural wrappers
│       │       ├── Header.tsx
│       │       ├── Sidebar.tsx
│       │       └── AppLayout.tsx
│       │
│       ├── features/                # Complex Domain-Driven Stateful Feature Modules
│       │   ├── landing/             # Public landing pages and marketing funnels
│       │   ├── auth/                # Sign In, SignUp, and Profile Management forms
│       │   ├── onboarding/          # Step-by-step goals & career assessment sequence
│       │   ├── dashboard/           # Widget containers (Risk Indicators, Today's focus)
│       │   ├── tasks/               # Kanban boards, task detail drawers, list views
│       │   ├── calendar/            # Month, Week, and Day planning grids
│       │   ├── focus-room/          # Pomodoro timers & ambient sounds engine
│       │   ├── panic-mode/          # Critical risk count-downs & emergency AI plans
│       │   └── coach/               # Conversational chat sidebars and action modules
│       │
│       ├── hooks/                   # Custom utility custom hooks
│       │   ├── useAudio.ts          # Focus-room sound synthesizers & ambient loops
│       │   └── useSpeech.ts         # Voice command & dictation API bindings
│       │
│       ├── services/                # Client-Side HTTP API client
│       │   └── api.ts               # Axios / Fetch client wrapped with JWT interceptors
│       │
│       └── store/                   # Zustand Unified Frontend Global Store Engine
│           ├── auth.store.ts        # Token cache, session metadata, profile data
│           ├── ui.store.ts          # Active themes, notifications, drawer open states
│           ├── focus.store.ts       # Live Pomodoro timers and active countdown state
│           └── panic.store.ts       # Active panic rooms and recovery state
```

---

## 2. Layered Architecture Specifications

### 2.1 Frontend Architecture (React SPA)
The client-side is configured as a component-driven Single Page Application (SPA) structured by **Domain-Driven Feature Folders**:
- **Presentational Layer**: Primitives (such as Button, Dialog, Card) are kept completely dumb, styled with Tailwind CSS, and located in `src/client/components/ui/`.
- **Feature Layer**: Business-level containers (such as the Focus Timer or Task list) reside in `/features/`. Each feature houses its internal components, forms, and localized hooks.
- **Unified Global State**: Powered by Zustand for lightweight reactive updates.
- **Asynchronous Server State**: Managed through TanStack (React) Query to isolate remote fetch cache, retry rules, optimistic updates, and background mutations.

### 2.2 Backend Architecture (Express.js Gateway)
A layered, server-side design ensuring clear data flow boundaries:
```text
[ Client Requests ]
        │
        ▼
[ API Middleware Router ] ──► (JWT Verification, Rate Limiting, Input Validation)
        │
        ▼
[ Route Controllers ] ─────► (Payload parsing, Response code compilation)
        │
        ▼
[ Logic Services ] ────────► (Core algorithms, Database Transactions, AI queries)
        │
        ▼
[ Infrastructure / DB ] ───► (Prisma / Gemini / Cloudinary Storage APIs)
```
1. **Controllers**: Pure input-output wrappers. They extract payloads, enforce auth structures via Request parameters, validate bodies via schema-validators, and map service results to HTTP status codes.
2. **Services**: Contain 100% of the actual calculations, external APIs, transactions, and business calculations. No controller ever queries database models directly; they delegate strictly to dedicated Services.

---

## 3. Communication & Integration Layers

### 3.1 API Layer (REST & Server-Sent Events)
- **Standard REST Routes**: Implemented over `/api/*` for structured, atomic actions. Responses are consistently enveloped:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- **Real-Time Communication via Server-Sent Events (SSE)**: Instead of implementing heavy bidirectional WebSockets, DeadlineZero implements highly efficient, unidirectional **Server-Sent Events** via `/api/notifications/stream`.
  - The client maintains an active EventSource connection.
  - The server broadcasts events (such as `taskUpdated`, `riskChanged`, or `notificationCreated`) to the active stream when backend mutation services are run.
  - Keeps HTTP connections highly performant, handles reconnect loops out-of-the-box, and minimizes container memory footprints.

### 3.2 Zustand Global Stores
Zustand is used to drive rapid, UI-centric state loops that do not map directly to server tables:
1. **`authStore`**: Manages the current access token in-memory, the active user’s profile state, and helper actions to flush sessions.
2. **`uiStore`**: Manages active sidebar collapse, toast notification systems, global modal layers, and drawer state arrays.
3. **`focusStore`**: Holds the tick logic, ticking interval loops, active task assignment, audio play status, and current seconds-remaining variables for the Pomodoro clock.
4. **`panicStore`**: Flags active panic conditions, maintains the tick of emergency recovery dashboards, and caches active AI plans.

### 3.3 React Query State Management
React Query manages all remote server-state caching, fetching, invalidation, and background synchronization:
- **Queries**: Fetches items such as task lists, calendar events, active profiles, and analytical metrics.
- **Mutations & Optimistic Updates**: When completing tasks, a React Query mutation immediately updates the local cache state, adjusting the UI instantly while validating the change asynchronously against the server-side REST api.
- **Cache Invalidation**: On SSE events (such as `taskUpdated`), the client instantly triggers query key invalidations (e.g., `['tasks']`), ensuring dashboard consistency.

---

## 4. AI & Service Architectures

### 4.1 Gemini API Integration Architecture
All AI interactions are managed server-side inside `/services/gemini.service.ts` using the **`@google/genai`** TypeScript SDK, ensuring API key security.
- **Model Standard**: Standardizes on the high-speed, low-latency `gemini-2.5-flash` for real-time triage, voice translations, and conversational coaching.
- **Context Loading Pipeline**:
  ```text
  [Request trigger] 
          │
          ▼
  Gather Context ──► User Tasks + Profiles + Calendar ranges + Productivity History
          │
          ▼
  Format Prompt ───► Combine context with highly structured, target-specific system instructions
          │
          ▼
  Gemini SDK Call ─► Enforce structured, schema-validated JSON outputs
          │
          ▼
  Process Output ──► Map output strictly to Database Models (Triage, Panic Recovery, etc.)
  ```
- **Structured JSON Formatting**: Employs Gemini's response schema constraints to force structured outputs. This guarantees that model replies cleanly match backend validation schemas.

### 4.2 AI Triage & Automation Services
- **AI Triage Engine**: Triggered automatically when tasks are created or updated. Compares estimated task completion durations against remaining capacity and upcoming deadlines to generate a dynamic `RiskPrediction` model, including risk levels and action-oriented explanations.
- **AI Automation Engine**: Runs as a background service. It scans for overdue milestones, tracks risk-level escalation, compiles automated rescheduling paths, logs details in the `AutomationLog` database table, and pushes real-time event updates to the SSE notifications hub.

### 4.3 Voice Assistant & Speech Processing
Voice actions are structured around hybrid client/server speech pipelines:
- **Audio Capturing**: React’s MediaRecorder captures spoken commands in the client's browser.
- **Server Speech-To-Text (STT) Processing**: The captured audio is streamed to the server endpoint `/api/voice/transcribe`, which utilizes Gemini's native multimodal capabilities to transcribe raw audio streams directly into text.
- **Natural Language Command Processing**: The transcribed text is sent to the command engine, which maps prompts (e.g., "Add a report task due tomorrow at 5 PM") into structured, programmatic API tasks.

---

## 5. System Workflows

### 5.1 Secure Authentication Flow
DeadlineZero employs dual-mechanism security via JWTs (JSON Web Tokens) with a secure HTTP-Only cookie rotation model:
- **Registration/Login**: Standard credentials (`email`/`password`) or federated Google OAuth logins.
- **Token Dispatch**: The server responds with two values:
  1. **Access Token**: A short-lived, stateful JWT (expiry 15 minutes) sent in the JSON payload, cached strictly in the client's memory (`authStore`).
  2. **Refresh Token**: A long-lived, cryptographically secure token stored as an `HTTP-Only`, `Secure`, and `SameSite=Strict` cookie, preventing client-side XSS access.
- **Silent Refresh Interception**: Client API instances (Axios/Fetch) intercept 401 HTTP codes. If an access token expires, a background call automatically hits `/api/auth/refresh` to rotate both access and refresh tokens seamlessly.

### 5.2 Multimodal File Uploads
Ensures smooth uploads and processing:
- **Dual Support**: Supports drag-and-drop or file selector uploads.
- **Upload Routing**: Files are uploaded directly to `/api/tasks/:id/attachments`.
- **Server Stream Piping**: The Express storage service handles files in memory and pipes them securely to Cloudinary storage buckets.
- **Relational Asset Association**: On successful cloud save, metadata (URL, file size, type, and names) is written to the `Attachment` table, instantly linking it to the specified Task.

### 5.3 Proactive Notifications System
Designed for immediate alerting and synchronization:
- **Unified Hub**: Standardized notification creations are written to the database under the `Notification` table.
- **SSE Stream Dispatch**: The `notify.service` intercepts the database write and pushes the notification object down the active client stream.
- **Dynamic Client Update**: The client-side SSE listener receives the event, flashes a micro-animated framer-motion toast banner, and increments the unread count inside the `uiStore` immediately without requiring a full page refresh.
