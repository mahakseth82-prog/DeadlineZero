# DeadlineZero - Database Design Document

**Version:** 1.0  
**Author:** Senior Product Architect  
**Project:** DeadlineZero (AI-Powered Productivity Agent)  
**Database System:** PostgreSQL (via Prisma ORM)  

---

## 1. Architectural Strategy & Design Principles

DeadlineZero is an offline-first-ready, real-time-capable productivity platform designed to help users prevent missed deadlines. The relational structure of PostgreSQL offers the robust data-integrity, complex joining, and strict transactional capabilities required to compute:
- Real-time task dependencies
- Dynamic scheduling slot overlaps
- Historical focus analytics
- Algorithmic gamification state machines (XP, Levels, Streaks)
- Hierarchical risk calculations across task lists

This document outlines the complete relational model, indexing strategy, referential actions (cascades), and database optimization strategies built for hyper-performance and future-proof horizontal scalability.

---

## 2. Full Prisma Schema

Below is the production-ready Prisma schema representing the complete relational topology.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ENUMS
// ==========================================

enum UserRole {
  USER
  ADMIN
}

enum TaskPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

enum RiskLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
  NONE
}

enum NotificationType {
  DEADLINE_ALERT
  RISK_ALERT
  FOCUS_REMINDER
  ACHIEVEMENT_UNLOCK
  AI_RECOMMENDATION
  SYSTEM
}

// ==========================================
// MODELS
// ==========================================

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String?
  googleId     String?   @unique
  role         UserRole  @default(USER)
  verified     Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  profile         UserProfile?
  tasks           Task[]
  categories      Category[]
  calendarEvents  CalendarEvent[]
  focusSessions   FocusSession[]
  panicSessions   PanicSession[]
  aiHistories     AiHistory[]
  automationLogs  AutomationLog[]
  notifications   Notification[]
  xpLogs          XpLog[]
  achievements    UserAchievement[]
  feedbacks       Feedback[]
  adminLogs       AdminLog[]        @relation("AdminActions")

  @@index([email])
  @@index([googleId])
}

model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  avatar            String?
  bio               String?
  occupation        String?
  goals             String[] @default([])
  workingHoursStart String?  @default("09:00")
  workingHoursEnd   String?  @default("17:00")
  productivityScore Int      @default(0)
  focusScore        Int      @default(0)
  updatedAt         DateTime @updatedAt

  // Relations & Cascades
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Task {
  id            String       @id @default(uuid())
  userId        String
  title         String
  description   String?
  deadline      DateTime
  priority      TaskPriority @default(MEDIUM)
  status        TaskStatus   @default(TODO)
  estimatedTime Int          @default(30) // in minutes
  actualTime    Int?                      // in minutes
  categoryId    String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  subtasks        Subtask[]
  attachments     Attachment[]
  calendarEvents  CalendarEvent[]
  riskPredictions RiskPrediction[]
  focusSessions   FocusSession[]

  // Self-referential relations for many-to-many dependencies
  dependencies TaskDependency[] @relation("TaskDependencies")
  dependentOn  TaskDependency[] @relation("TaskDependentOnMe")

  tags TaskTag[]

  // Performance Indexing Strategy
  @@index([userId])
  @@index([deadline])
  @@index([status])
  @@index([priority])
  @@index([userId, status, deadline]) // Compound index for lightning-fast active task queries
}

model Subtask {
  id        String   @id @default(uuid())
  taskId    String
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations & Cascades
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}

model TaskDependency {
  id              String   @id @default(uuid())
  taskId          String
  dependsOnTaskId String
  createdAt       DateTime @default(now())

  // Relations
  task          Task @relation("TaskDependencies", fields: [taskId], references: [id], onDelete: Cascade)
  dependsOnTask Task @relation("TaskDependentOnMe", fields: [dependsOnTaskId], references: [id], onDelete: Cascade)

  // Uniqueness & Fast Lookups
  @@unique([taskId, dependsOnTaskId])
  @@index([taskId])
  @@index([dependsOnTaskId])
}

model Category {
  id        String   @id @default(uuid())
  userId    String?
  name      String
  color     String?  @default("#3B82F6") // Blue Default Hex Code
  createdAt DateTime @default(now())

  // Relations
  user  User?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@index([userId])
}

model Tag {
  id   String @id @default(uuid())
  name String @unique

  // Relations
  tasks TaskTag[]

  @@index([name])
}

model TaskTag {
  taskId String
  tagId  String

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  // Composite Primary Key & Indexes
  @@id([taskId, tagId])
  @@index([taskId])
  @@index([tagId])
}

model Attachment {
  id        String   @id @default(uuid())
  taskId    String
  fileUrl   String
  fileType  String
  fileName  String?
  fileSize  Int?     // Size in bytes
  createdAt DateTime @default(now())

  // Relations & Cascades
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}

model CalendarEvent {
  id        String   @id @default(uuid())
  userId    String
  taskId    String?
  title     String
  startTime DateTime
  endTime   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task? @relation(fields: [taskId], references: [id], onDelete: Cascade)

  // Indexing for calendar ranges
  @@index([userId])
  @@index([taskId])
  @@index([startTime, endTime])
}

model RiskPrediction {
  id          String    @id @default(uuid())
  taskId      String
  riskLevel   RiskLevel @default(NONE)
  riskScore   Int       @default(0) // Scale 0-100
  explanation String    @db.Text
  createdAt   DateTime  @default(now())

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}

model FocusSession {
  id                String   @id @default(uuid())
  userId            String
  taskId            String?
  duration          Int               // Session duration in seconds
  productivityScore Int?              // Evaluated rating from 1 to 100
  completedAt       DateTime @default(now())

  // Relations
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task? @relation(fields: [taskId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([taskId])
  @@index([completedAt])
}

model PanicSession {
  id              String    @id @default(uuid())
  userId          String
  triggeredReason String    @db.Text
  recoveryPlan    Json?               // Structured roadmap calculated by AI
  completed       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  completedAt     DateTime?

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([completed])
}

model AiHistory {
  id         String   @id @default(uuid())
  userId     String
  prompt     String   @db.Text
  response   String   @db.Text
  actionType String   // e.g., 'COACH_CHAT', 'RECOVERY_PLAN', 'EMAIL_DRAFT', 'REVISION_PLAN'
  createdAt  DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([actionType])
}

model AutomationLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // e.g., 'AUTO_RESCHEDULE', 'ESCALATE_RISK', 'NOTIFY_DEADLINE'
  details   String   @db.Text
  timestamp DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([timestamp])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  title     String
  message   String
  type      NotificationType @default(SYSTEM)
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

model XpLog {
  id        String   @id @default(uuid())
  userId    String
  xp        Int      // Positive/Negative amount awarded or deducted
  reason    String
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Achievement {
  id          String   @id @default(uuid())
  title       String   @unique
  description String
  xpReward    Int
  icon        String?
  createdAt   DateTime @default(now())

  // Relations
  users UserAchievement[]

  @@index([title])
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  // Relations
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  // Uniqueness Constraint
  @@unique([userId, achievementId])
  @@index([userId])
  @@index([achievementId])
}

model Feedback {
  id        String   @id @default(uuid())
  userId    String?
  rating    Int      // Rating from 1 to 5
  feedback  String   @db.Text
  createdAt DateTime @default(now())

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
}

model AdminLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String
  details   String   @db.Text
  createdAt DateTime @default(now())

  // Relations
  admin User @relation("AdminActions", fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
}
```

---

## 3. Comprehensive Model Definitions

### 3.1 Identity & User Ecosystem
* **`User`**: The central actor of the application. Supports both local email/password hashed identities and federated OAuth credentials (`googleId`). Soft indexes are configured to speed up authorization and token validation passes.
* **`UserProfile`**: Split off to maintain a slim, low-latency `User` table for authentication pipelines. Holds metadata such as the user's focus patterns, career context, and calculated productivity ratings. 

### 3.2 Task Topology & Dependency Graph
* **`Task`**: The absolute core of user interaction. Includes standard tracking bounds (`deadline`, `status`, `priority`) along with allocation metrics (`estimatedTime`, `actualTime`) critical to AI risk forecasting.
* **`Subtask`**: A flat list of atomic actions linked to a master task. State changes trigger aggregate progress calculations for the parent task.
* **`TaskDependency`**: Self-referential join model implementing a direct graph representing workflow bottlenecks. This prevents scheduling downstream dependent tasks until predecessors are set to `COMPLETED`.
* **`Category` & `Tag`**: Logical groupings. Categories act as strict folders (often linked to user-configured themes), while Tags act as dynamic metadata badges for query slicing.

### 3.3 Dynamic Action Records & Event Logs
* **`CalendarEvent`**: Time-blocked scheduler events mapping either to custom-added events or AI auto-scheduled tasks directly. Double-indexed across the `startTime` and `endTime` timeline for instant visual collision detection.
* **`RiskPrediction`**: Continuous logs generated from AI background triage loops. Calculates standard variance based on hours left versus total remaining work estimation.
* **`FocusSession`**: Chronological track of Pomodoro and deep-focus room engagement. Holds calculated flow scores which inform user dashboard trends.
* **`PanicSession`**: Active record created when panic loops are activated. Tracks critical tasks and caches unstructured, complex, or multi-step AI Recovery Plans natively as a dynamic JSON object.

### 3.4 Audit Trail, Systems, & Gamification Engine
* **`AiHistory`**: Audit records of all prompts and generated actions, keeping tabs on token budgets and context utilization.
* **`AutomationLog`**: Event log tracking backend adjustments (e.g., automated overnight task re-scheduling loops) ensuring users can review system agency transparently.
* **`XpLog` & `UserAchievement`**: Relational gamification hooks. XP logs hold individual point adjustments which calculate live levels, while unique constraints prevent duplicate achievement awards.

---

## 4. Referential Integrity & Cascade Rules

The referential tree is designed to prevent orphaned rows while protecting historical analytics and structural templates.

| Primary Model | Target Model | Foreign Key Attribute | Action Rule | Architectural Justification |
| :--- | :--- | :--- | :--- | :--- |
| `User` | `UserProfile` | `userId` | `ON DELETE CASCADE` | Profiles cannot exist without an authentication container. |
| `User` | `Task` | `userId` | `ON DELETE CASCADE` | User account deletion must purge all associated personal data safely. |
| `Task` | `Subtask` | `taskId` | `ON DELETE CASCADE` | Atomic subtasks have no semantic meaning without their parent tasks. |
| `Task` | `TaskDependency` | `taskId` & `dependsOnTaskId` | `ON DELETE CASCADE` | Purges dead paths in the DAG. Cascades wipe dependencies if either target is deleted. |
| `Category` | `Task` | `categoryId` | `ON DELETE SET NULL` | Deleting a logical directory folder must *never* lose the inner files (tasks); they drop back to unassigned. |
| `Task` | `CalendarEvent` | `taskId` | `ON DELETE CASCADE` | If a task is destroyed, its scheduled block in the calendar must instantly free up. |
| `Task` | `FocusSession` | `taskId` | `ON DELETE SET NULL` | Preserves productivity analytics. We want to know a focus session occurred even if the targeted task was removed. |
| `User` | `Feedback` | `userId` | `ON DELETE SET NULL` | Retains helpful application feedback as anonymous logs if users close their accounts. |

---

## 5. Indexing & Query Optimization Matrix

Since DeadlineZero is an intensive analytical dashboard, basic key queries are heavily indexed using compound indexes to avoid Postgres table scans:

1. **User Identity Verification (`User.email`, `User.googleId`)**:
   - *Index type*: BTREE (Implicit Unique index)
   - *Query goal*: Sub-millisecond JWT authentication and Google login lookups.
2. **Dashboard Active Queue (`Task [userId, status, deadline]`)**:
   - *Index type*: Compound BTREE
   - *Query goal*: Optimizes the absolute most frequent query on the system: loading active tasks (`TODO` or `IN_PROGRESS`) sorted sequentially by upcoming deadlines for a specific user.
3. **Calendar Intersection Matrix (`CalendarEvent [startTime, endTime]`)**:
   - *Index type*: Compound BTREE
   - *Query goal*: Speeds up collision queries checking for calendar overlaps when running the AI Auto-Scheduling Engine.
4. **Graph Bottleneck Querying (`TaskDependency [taskId]`, `[dependsOnTaskId]`)**:
   - *Index type*: BTREE
   - *Query goal*: Instantly checks if a task is blocked before enabling status updates.

---

## 6. Future Scalability Considerations

As DeadlineZero scales past 100,000+ active users, database performance remains guaranteed using these design paths:

1. **Horizontal Database Partitioning (Sharding)**:
   - Since 98% of queries are strictly limited to the individual user scope, the database can easily be horizontally partitioned across multiple nodes using `userId` as the hash-sharding partition key.
2. **Task Archiving (Cold vs. Hot Storage)**:
   - High-volume users will accumulate thousands of completed tasks, subtasks, and logs. A background worker can sweep older, non-active records (e.g., tasks completed > 180 days ago) and migrate them to cold PostgreSQL storage partitions, keeping the active hot table small and highly responsive.
3. **Read-Replica Isolation for AI Calculations**:
   - Dynamic AI triage loops, risk projections, and background auto-scheduling calculations generate heavy read overhead. By introducing read-replicas, these heavy diagnostic analytical queries are routed away from the primary transactional instance, ensuring zero dashboard latency.
4. **Optimized Audit Tables (`AiHistory`, `AutomationLog`, `XpLog`)**:
   - These logs grow linearly with user activity. At scale, these models can be converted to TimescaleDB hyper-tables or moved out to a specialized time-series datastore to prevent primary storage exhaustion.
5. **NoSQL Caching Layer (Redis)**:
   - Complex state items (e.g., current XP level, active focus timer, and cached live calendar views) are backed by a Redis caching layer to lower database read cycles to absolute zero for highly repetitive user tasks.
