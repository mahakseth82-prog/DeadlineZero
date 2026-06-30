<div align="center">

# DeadlineZero

### Turning deadline panic into intelligent execution — powered by Google Gemini.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Google_Cloud_Run-4285F4?style=for-the-badge)](https://deadlinezero-9197800550.asia-south1.run.app)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_API-8E24AA?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Built with AI Studio](https://img.shields.io/badge/Built_with-Google_AI_Studio-34A853?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![Firebase](https://img.shields.io/badge/Auth-Firebase-FF6F00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![Cloud Run](https://img.shields.io/badge/Hosted_on-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)

**Built for the Google Hackathon — "The Last-Minute Life Saver" track**

**[🌐 Try the Live App](https://deadlinezero-9197800550.asia-south1.run.app)** &nbsp;·&nbsp; **[📂 GitHub Repo](#)** &nbsp;·&nbsp; **[🎥 Demo Video](#)**

</div>

<br>

<!--
  📸 ADD SCREENSHOTS / DEMO GIF HERE — this is the single highest-impact section for judges.
  Recommended: 1 hero GIF (15-20s) showing AI Coach + Task Breakdown in action,
  or 3 screenshots: Dashboard | AI Coach | Voice Task Parsing
-->
<div align="center">
  <img src="docs/demo.gif" alt="DeadlineZero demo" width="800">
  <br><br>
  <table>
    <tr>
      <td><img src="https://private-user-images.githubusercontent.com/228431672/615098663-628f24c4-8e48-4573-b8c3-802ca8f98536.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODI4MTYzNDksIm5iZiI6MTc4MjgxNjA0OSwicGF0aCI6Ii8yMjg0MzE2NzIvNjE1MDk4NjYzLTYyOGYyNGM0LThlNDgtNDU3My1iOGMzLTgwMmNhOGY5ODUzNi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYzMFQxMDQwNDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0yODhjNTU0ZTM3NDY4NTZmMTBmMDZiNWE3OTAwYzkxMDViNGMzNzhmZDhjZDkzNGJlMTI1YzNiZWYxOGI5MDEzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.WQYfElrZ4qNV5EtOSBZY1j8CkSsxDSmNkJSLG4bhcis" width="260" alt="Dashboard"></td>
      <td><img src="https://private-user-images.githubusercontent.com/228431672/615100566-f3db4172-cfcb-438c-aab2-9302c26630e8.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODI4MTY0MDksIm5iZiI6MTc4MjgxNjEwOSwicGF0aCI6Ii8yMjg0MzE2NzIvNjE1MTAwNTY2LWYzZGI0MTcyLWNmY2ItNDM4Yy1hYWIyLTkzMDJjMjY2MzBlOC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYzMFQxMDQxNDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00MjIxM2UxMmQyYTVjZDk4MmFmMzRhN2YyMmQyN2FlZWUxYWZhMTNjZmFjMjllY2Y2MzQwODZlZmYwZDc5ZmFkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.t2QNLOy64Qlmly9vNUoZSPGBbWet4BjuMrR9Zs-rrJU" width="260" alt="AI Coach"></td>
      <td><img src="https://private-user-images.githubusercontent.com/228431672/615101848-aee12f31-5c4e-4e0e-bca0-15fd3ab7d873.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODI4MTY1NTAsIm5iZiI6MTc4MjgxNjI1MCwicGF0aCI6Ii8yMjg0MzE2NzIvNjE1MTAxODQ4LWFlZTEyZjMxLTVjNGUtNGUwZS1iY2EwLTE1ZmQzYWI3ZDg3My5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYzMFQxMDQ0MTBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0xNWU1ODE1NDYwY2I1ZmYwNGEyZjQ1OGM0Y2FiZTY1NTU1NTMyZTIyOTVjZDhlMDgzYzliMmE4ZjJlZWFhYjRhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.agDKuGxfa2HVzI_6DRsMitG-VpfkiKRCuanyigYnCTA" width="260" alt="Task Section"></td>
    </tr>
    <tr>
      <td align="center"><sub>Dashboard</sub></td>
      <td align="center"><sub>AI Coach</sub></td>
      <td align="center"><sub>Voice Task Parsing</sub></td>
    </tr>
  </table>
</div>

---

## The Problem

Students, professionals, and entrepreneurs constantly miss deadlines — not because they lack tools, but because existing task managers only **store** tasks. They send passive reminders that are easy to ignore and offer zero help when someone is actually overwhelmed and out of time.

## The Solution

**DeadlineZero is an AI productivity coach, not a to-do list.** It uses **Google Gemini** to actively analyze your workload, tell you what to do *right now*, and break down anything too big to start — turning last-minute panic into a clear, executable plan.

---

## ⭐ What Makes This Different

> **It doesn't just remind you. It thinks with you.**

| Traditional To-Do App | DeadlineZero |
|---|---|
| Static reminder at a fixed time | AI continuously re-assesses risk as your workload changes |
| You manually prioritize | Gemini ranks tasks by urgency + effort + deadline pressure |
| Big tasks sit untouched | Gemini auto-splits them into actionable subtasks |
| Typing required to log tasks | Speak naturally — AI extracts the full structured task |

---

## ✨ Core Features

### 🤖 AI Productivity Coach — *the heart of DeadlineZero*
Real-time Gemini-powered analysis of your entire workload: deadline risk scoring, daily planning, focus-session suggestions, and priority re-ranking as things change throughout the day.

### ✂️ AI Task Breakdown
Drop in a big, vague task ("finish thesis chapter") and Gemini returns a time-boxed sequence of concrete subtasks — the difference between procrastinating and starting.

### 🎙️ Voice Task Parsing
Speak a task naturally. Gemini extracts title, priority, deadline, estimated duration, and category — no forms, no friction.

### 📋 Smart Task Management
Full CRUD task management with categories, priorities, deadlines, and progress tracking.

### 📊 Dashboard & 📅 Calendar
At-a-glance productivity metrics, completion stats, deadline risk visualization, and a calendar view for visual scheduling.

### 🔐 Authentication
Firebase-backed email/password and Google Sign-In with secure session management.

---

## 🧪 Built With Google AI Studio

This project's development workflow itself was powered by **[Google AI Studio](https://aistudio.google.com)** — used extensively for prompt design, prototyping AI behaviors, and iterating on Gemini integrations before wiring them into the application.

- **Prompt engineering & testing**: AI Studio was used to design and refine the prompts behind the AI Coach, task breakdown, and voice parsing features — testing different prompt structures against real task data to get consistent, structured Gemini outputs.
- **Rapid iteration**: Features were prototyped directly in AI Studio's playground to validate behavior (e.g., subtask quality, risk-scoring logic) before integrating the finalized prompts into the Express backend.
- **Model behavior tuning**: Response formatting, schema consistency, and edge-case handling for Gemini outputs were iterated on in AI Studio to ensure reliable JSON structures the frontend could consume directly.

Using AI Studio as the development environment for the AI layer meant the prompts powering DeadlineZero's core intelligence were tested and validated *before* becoming part of the production codebase — directly aligned with the hackathon's emphasis on building with Google's AI tooling end-to-end.

---

## 🛠 How We Used Gemini

DeadlineZero doesn't just call the Gemini API for generic text — it's the decision-making core of the app:

- **Risk scoring**: Gemini is fed each task's deadline, estimated effort, and current workload to output a prioritized, risk-ranked list — not a simple "sort by due date."
- **Subtask generation**: structured prompts ask Gemini to decompose tasks into time-boxed, actionable steps rather than vague suggestions.
- **Voice-to-structured-task**: free-form speech is parsed into a strict schema (title, priority, deadline, duration, category) so it slots directly into the task system with no manual cleanup.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router |
| Backend | Node.js, Express.js |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |
| AI | Google Gemini API |
| Deployment | Google Cloud Run |

---

## ☁️ Google Technologies Used

| Technology | Role |
|---|---|
| **Google Gemini API** | AI coaching, task breakdown, voice parsing, risk-based prioritization |
| **Google AI Studio** | Prompt design, prototyping, and testing for all Gemini-powered features |
| **Firebase Authentication** | Secure email/password and Google Sign-In |
| **Cloud Firestore** | Real-time database for tasks, profiles, productivity data |
| **Google Cloud Run** | Auto-scaling, containerized production hosting |

---

## 🏗 Architecture

```
React 19 + TypeScript  (Frontend)
            │
            ▼
   Node.js + Express.js  (Backend API)
            │
   ┌────────┴────────┐
   ▼                 ▼
Gemini API     Cloud Firestore
(AI Engine)    (Real-time Data)
   │                 │
   └────────┬────────┘
            ▼
 Firebase Authentication
            │
            ▼
      Google Cloud Run
      (Production Host)
```

---

## 🔮 What's Next

- [ ] Google Calendar synchronization
- [ ] Fully autonomous AI scheduling
- [ ] Team collaboration & shared deadlines
- [ ] Native mobile app (iOS/Android)
- [ ] Predictive deadline forecasting from historical patterns
- [ ] AI-generated study/project plans

---

<details>
<summary><strong>🚀 Run It Locally</strong> (click to expand)</summary>

<br>

**Prerequisites:** Node.js 18+, a [Gemini API key](https://ai.google.dev), a [Firebase project](https://console.firebase.google.com)

```bash
# Clone
git clone <repository-url>
cd deadlinezero

# Install
npm install

# Configure environment
# Create a .env file:
GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Run dev server
npm run dev

# Production build
npm run build
npm start
```

**Project structure:**
```
src/
├── client/
│   ├── features/      # Task, Coach, Calendar, Dashboard modules
│   ├── components/    # Shared UI components
│   ├── store/         # Zustand state stores
│   ├── services/      # API + Firebase service layer
│   └── utils/
├── server.ts
└── vite.config.ts
```

</details>

---

## 👩‍💻 Author

**Mahak Seth** — B.Tech CSE Student · Aspiring AI & Full Stack Developer

## 🙏 Acknowledgements

[Google Gemini API](https://ai.google.dev) · [Google AI Studio](https://aistudio.google.com) · [Google Cloud Run](https://cloud.google.com/run) · [Firebase](https://firebase.google.com) · [React](https://react.dev) · [Vite](https://vitejs.dev) · [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

⭐ **If you like this project, consider giving it a star!**

**[⬆ Back to Top](#deadlinezero)**

</div>
