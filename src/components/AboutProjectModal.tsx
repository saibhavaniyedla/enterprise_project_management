import React from 'react';
import {
  X,
  BookOpen,
  Layers,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Mail,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Terminal,
  Calendar,
  Users,
  Kanban,
  ExternalLink,
} from 'lucide-react';

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  onOpenFeedback?: () => void;
}

export const AboutProjectModal: React.FC<AboutProjectModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  onOpenFeedback,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                PROJECT DOCUMENTATION & KNOWLEDGE BASE
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                About This Project
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-slate-300 text-xs leading-relaxed">
          {/* Hero Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/60 border border-indigo-500/20 space-y-2">
            <p className="text-slate-200 font-medium text-sm">
              Welcome to the <strong className="text-white">FusionSprint Enterprise</strong> platform. This knowledge base provides an in-depth overview of the architecture, core modules, requirements, and engineering team.
            </p>
          </div>

          {/* Section 1: Project Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Project Overview</span>
            </h3>
            <p className="text-slate-300">
              An enterprise-grade project management and sprint acceleration platform that enables software teams and organizations to manage workspaces, sprint backlogs, task assignments, engineer capacities, live meetings, developer workflows, and AI-driven analytics from a single unified application.
            </p>
          </div>

          {/* Section 2: Core Capabilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Core Features & Capabilities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'User Authentication & RBAC', desc: 'Secure login, role-scoped access (view assigned projects only), and credentials management.' },
                { title: 'Workspace Management', desc: 'Multi-workspace switching, team member directories, activity audit trails, and live Firestore sync.' },
                { title: 'Project & Sprint Boards', desc: 'Interactive Kanban, sprint lifecycle management, story points estimations, and velocity metrics.' },
                { title: 'Task Tracking & Workflow', desc: 'Custom tags, priority matrices, subtasks, deadline notifications, and live status updates.' },
                { title: 'Real-Time Team Invitations', desc: 'Instant email verification, duplicate-prevention guardrails, and mail client dispatch.' },
                { title: 'Developer Hub & GitHub', desc: 'Repository sync, commit history, pull request reviews, and continuous integration trackers.' },
                { title: 'Meeting Scheduler & Sync', desc: 'Google Calendar integration, standup agenda generation, and automated calendar invitations.' },
                { title: 'Gemini AI Sprint Copilot', desc: 'Intelligent sprint risk detection, workload balancing suggestions, and backlog summaries.' },
              ].map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Architecture & Tech Stack */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>System Architecture & Technology Stack</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Frontend Tier</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion animations, responsive layouts.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Backend & APIs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Node.js / Express server, Google GenAI SDK (Gemini 2.5 Flash), Nodemailer / real-time email dispatch.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Database & Storage</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Firebase Firestore with real-time snapshot listeners, multi-tenant collections, and audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Engineering Team & Authors */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Engineering Team & Project Authors</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Sai Bhavani Yedla"
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm">Sai Bhavani Yedla</h4>
                  <p className="text-xs text-indigo-400 font-semibold">Lead Developer & Architect</p>
                  <p className="text-[11px] text-slate-400">CBIT • 3rd Year</p>
                  <a
                    href="mailto:saibhavaniyedla35@gmail.com"
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 mt-1 font-mono"
                  >
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>saibhavaniyedla35@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250"
                  alt="Bhargavi"
                  className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/40"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm">Bhargavi</h4>
                  <p className="text-xs text-violet-400 font-semibold">Frontend & UI/UX Engineer</p>
                  <p className="text-[11px] text-slate-400">Vasavi • 3rd Year</p>
                  <a
                    href="mailto:bhargavi@example.com"
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 mt-1 font-mono"
                  >
                    <Mail className="w-3 h-3 text-violet-400" />
                    <span>bhargavi@example.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenContact && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Contact Us</span>
              </button>
            )}
            {onOpenFeedback && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Give Feedback</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
