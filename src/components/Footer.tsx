import React from 'react';
import {
  Heart,
  Mail,
  MessageSquarePlus,
  GraduationCap,
  Sparkles,
  BookOpen,
  Send,
  Home,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface FooterProps {
  onNavigateHome?: () => void;
  onOpenAbout?: () => void;
  onOpenFeedback: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onOpenAbout,
  onOpenFeedback,
  onOpenContact,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#080a10] border-t border-slate-800/80 text-slate-400 text-xs select-none mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Top Header & Navigation Links Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
              FS
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                FusionSprint Enterprise
              </h3>
              <p className="text-[11px] text-slate-400">
                Enterprise project management, built for high-performing agile teams.
              </p>
            </div>
          </div>

          {/* Navigation Bar Links: Home | About | Feedback | Contact */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-indigo-400" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={onOpenAbout}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>About</span>
            </button>

            <button
              type="button"
              onClick={onOpenFeedback}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Feedback</span>
            </button>

            <button
              type="button"
              onClick={onOpenContact}
              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-violet-400" />
              <span>Contact</span>
            </button>
          </div>
        </div>

        {/* 3-Column Info & Developer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: System Overview */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Architecture & Persistence
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full-stack agile execution engine powered by live Firebase Firestore synchronization, Gemini AI risk analytics, and real-time email dispatching.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Live Sync
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[10px]">
                v1.5 Enterprise
              </span>
            </div>
          </div>

          {/* Column 2: Developer 1 (Sai Bhavani Yedla) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                alt="Sai Bhavani Yedla"
                className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate">Sai Bhavani Yedla</div>
                <div className="text-[11px] text-indigo-400 font-medium">CBIT • 3rd Year</div>
                <div className="text-[10px] text-slate-400">Lead Architect & Full Stack</div>
              </div>
            </div>
            <a
              href="mailto:saibhavaniyedla35@gmail.com"
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 font-mono pt-1 border-t border-slate-800/60"
            >
              <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">saibhavaniyedla35@gmail.com</span>
            </a>
          </div>

          {/* Column 3: Developer 2 (Bhargavi) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250"
                alt="Bhargavi"
                className="w-10 h-10 rounded-full object-cover border border-violet-500/40"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate">Bhargavi</div>
                <div className="text-[11px] text-violet-400 font-medium">Vasavi • 3rd Year</div>
                <div className="text-[10px] text-slate-400">Frontend & UI/UX Engineer</div>
              </div>
            </div>
            <a
              href="mailto:bhargavi@example.com"
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 font-mono pt-1 border-t border-slate-800/60"
            >
              <Mail className="w-3 h-3 text-violet-400 shrink-0" />
              <span className="truncate">bhargavi@example.com</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {currentYear} FusionSprint Enterprise. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span>
              Support:{' '}
              <a
                href="mailto:saibhavaniyedla35@gmail.com"
                className="text-slate-300 hover:text-white underline font-mono"
              >
                saibhavaniyedla35@gmail.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
