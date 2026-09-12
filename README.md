# 🚀 Enterprise Project Management SaaS

A modern, high-performance, full-stack project management platform that enables agile teams to collaborate in real time, plan sprints, manage backlogs, track project timelines, analyze sprint delivery risks with AI, and capture visual camera assets.

Inspired by industry-standard enterprise solutions like Jira, Trello, and Asana, this application provides an end-to-end workspace for engineering and product teams.

---

## 🌟 Key Features & Modules

### 1. 📊 Interactive Agile Boards & Task Management
- **Kanban Board View**: Organize tasks into `To Do`, `In Progress`, `Review`, and `Done` columns with smooth interaction and status updates.
- **Task Creation & Detail Modal**: Manage story points, assignees, priorities, subtasks, tags, start/due dates, and discussion comments.
- **Advanced Filtering**: Filter tasks instantly by keyword search, status, priority, and assignee.

### 2. 📅 Visual Gantt Timeline View
- **Schedule & Dependencies**: Visualize task timelines across days/weeks with progress indicators and status badges.
- **Milestone Tracking**: Monitor active tasks and deliverable schedules at a glance.

### 3. 🤖 AI Sprint Risk Analyzer
- **Gemini AI Integration**: Leverages Google Gemini (`@google/genai`) to analyze sprint tasks, story point loads, and deadlines.
- **Executive Insights**: Generates a Sprint Health Score (0-100), executive summary, risk warnings with concrete recommendations, bottleneck detection, and action items.
- **Intelligent Fallback**: Works seamlessly even without an API key using local enterprise heuristic analysis.

### 4. 📷 Visual Camera Assets & Wiki Documentation
- **Camera API Capture**: Snap real-time physical whiteboard diagrams, architecture sketches, or wireframe notes using your device camera.
- **Asset Manager**: Store and filter visual assets by category (`Architecture`, `UI Wireframes`, `Camera Snapshot`, `Diagram`, `Artifact`) with local and cloud storage.
- **Image Upload & Fullscreen Preview**: Upload local images, view high-resolution snapshots in full screen, and download assets directly.

### 5. 👥 Workspaces, Sprints & Team Activity Logs
- **Multi-Workspace Hierarchy**: Seamlessly switch between workspaces and projects.
- **Real-Time Activity Feed**: Automated audit logs tracking task movements, comments, and priority updates across the team.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Motion (Animations), Recharts (Analytics), Lucide React (Icons)
- **Backend**: Node.js, Express, `tsx` (Dev Execution), `esbuild` (Production Bundle)
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Database & Auth**: Firebase Firestore & Firebase Auth Ready

---

## ⚙️ Prerequisites

Before executing the project, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **Package Manager**: `npm` (v9+) or `bun`

---

## 🚀 How to Execute / Run the Project

Follow these steps to run the application locally or in a production environment:

### Step 1: Clone the Repository & Navigate to Directory
```bash
git clone <repository-url>
cd enterprise-project-management-saas
```

### Step 2: Install Dependencies
Run the package manager installation command:
```bash
npm install
```
*(Or if using Bun: `bun install`)*

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and configure optional keys:
```env
# Optional: Provide Gemini API key for live AI Sprint Risk Analysis
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run in Development Mode
Start the full-stack Express + Vite dev server:
```bash
npm run dev
```
The server will boot on `http://localhost:3000` (or `http://0.0.0.0:3000`).
Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Build & Execution

To compile and execute the app for production deployment:

### Step 1: Build the Application
```bash
npm run build
```
This script runs `vite build` for client assets and `esbuild` to compile `server.ts` into a standalone CommonJS bundle at `dist/server.cjs`.

### Step 2: Start the Production Server
```bash
npm run start
```
Launch the built server using Node.js:
```bash
node dist/server.cjs
```
Access the production application at `http://localhost:3000`.

---

## 📁 Directory Structure

```
├── .env.example            # Environment variable template
├── metadata.json           # Application permissions & capabilities
├── package.json            # NPM dependencies & build scripts
├── server.ts               # Express API backend & Vite middleware
├── vite.config.ts          # Vite bundling configuration
├── src/
│   ├── main.tsx            # React application entry point
│   ├── App.tsx             # Main dashboard layout & view routing
│   ├── index.css           # Global Tailwind CSS imports
│   ├── types.ts            # Global TypeScript interface definitions
│   ├── assets/             # Team headshots & image assets
│   ├── components/
│   │   ├── layout/         # Navigation sidebar, top header, search
│   │   ├── modals/         # Create Task, AI Analyzer, & Detail Modals
│   │   ├── views/          # Board, Timeline, Sprints, Analytics, Wiki
│   ├── data/               # Rich seed data for enterprise workspaces
```

---

## 👩‍💻 Project Team & Credits

- **Sai Bhavani Yedla** — Product Engineer • CBIT 3rd Year (`saibhavaniyedla35@gmail.com`)
- **Bhargavi** — Frontend Engineer • Vasavi 3rd Year

---

## 📄 License

This project is licensed under the MIT License.
