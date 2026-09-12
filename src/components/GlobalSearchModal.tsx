import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  FolderKanban,
  User,
  BookOpen,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
} from 'lucide-react';
import { Task, Project, TeamMember } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
  projects?: Project[];
  members?: TeamMember[];
  onSelectTask: (t: Task) => void;
  onSelectProject: (p: Project) => void;
  onSelectTab: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks = [],
  projects = [],
  members = [],
  onSelectTask,
  onSelectProject,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { tasks: [], projects: [], members: [], docs: [] };
    const q = query.toLowerCase().trim();

    const matchedTasks = tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.status.toLowerCase().includes(q) ||
          t.priority.toLowerCase().includes(q)
      )
      .slice(0, 6);

    const matchedProjects = projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const matchedMembers = members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const docsList = [
      { id: 'w-1', title: 'System Architecture Blueprint & Database Sharding', category: 'Architecture' },
      { id: 'w-2', title: 'API Integration & OAuth Authentication Workflow', category: 'Security' },
      { id: 'w-3', title: 'Sprint Release Checklist & PgBouncer Setup', category: 'DevOps' },
      { id: 'w-4', title: 'Design System & UI Component Specifications', category: 'Design' },
    ];

    const matchedDocs = docsList
      .filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return {
      tasks: matchedTasks,
      projects: matchedProjects,
      members: matchedMembers,
      docs: matchedDocs,
    };
  }, [query, tasks, projects, members]);

  if (!isOpen) return null;

  const totalResults =
    searchResults.tasks.length +
    searchResults.projects.length +
    searchResults.members.length +
    searchResults.docs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, projects, team members, or docs... (Press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-800 text-slate-400 rounded-md border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {!query.trim() ? (
            <div className="py-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400">
                Type keywords like <span className="text-indigo-300 font-bold">"Auth"</span>,{' '}
                <span className="text-indigo-300 font-bold">"PgBouncer"</span>, or{' '}
                <span className="text-indigo-300 font-bold">"Sprint"</span> to search instantly across the entire workspace.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                  💡 Hint: Click any item to navigate directly.
                </span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs italic">
              No matching tasks, projects, or docs found for "{query}".
            </div>
          ) : (
            <>
              {/* Tasks Section */}
              {searchResults.tasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tasks ({searchResults.tasks.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          onSelectTask(task);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                            {task.key}
                          </span>
                          <span className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {task.status.toUpperCase()}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {searchResults.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Projects ({searchResults.projects.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            {proj.key}
                          </span>
                          <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                            {proj.name}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Section */}
              {searchResults.members.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>Team Members ({searchResults.members.length})</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          onSelectTab('team');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 cursor-pointer transition flex items-center gap-2.5"
                      >
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{member.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wiki Docs Section */}
              {searchResults.docs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Documentation ({searchResults.docs.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.docs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSelectTab('wiki');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {doc.category}
                          </span>
                          <span className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                            {doc.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0a0b10] border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Acme Global Workspace Search</span>
          <span className="font-mono">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
