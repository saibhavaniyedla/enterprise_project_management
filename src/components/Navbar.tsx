import React from 'react';
import {
  Layers,
  Search,
  Plus,
  Sparkles,
  Users,
  LayoutGrid,
  CalendarDays,
  Table as TableIcon,
  BarChart3,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Workspace, Project, Sprint, TeamMember } from '../types';

interface NavbarProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
  projects: Project[];
  currentProject: Project;
  onSelectProject: (proj: Project) => void;
  sprints: Sprint[];
  currentSprint: Sprint;
  onSelectSprint: (sprint: Sprint) => void;
  activeView: 'board' | 'timeline' | 'table' | 'analytics';
  onChangeView: (view: 'board' | 'timeline' | 'table' | 'analytics') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewTask: () => void;
  onOpenAIInsights: () => void;
  onOpenTeamDirectory: () => void;
  members: TeamMember[];
}

export const Navbar: React.FC<NavbarProps> = ({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  projects,
  currentProject,
  onSelectProject,
  sprints,
  currentSprint,
  onSelectSprint,
  activeView,
  onChangeView,
  searchQuery,
  onSearchChange,
  onOpenNewTask,
  onOpenAIInsights,
  onOpenTeamDirectory,
  members,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Bar: Branding, Workspace, Project, Sprint, Search, Actions */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-900 leading-none text-base">
                FusionSprint
              </h1>
              <span className="text-xs text-slate-500 font-medium">Enterprise PM SaaS</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Project Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition text-sm font-medium text-slate-800">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentProject.color }}
              />
              <span className="max-w-[140px] truncate">{currentProject.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Project menu */}
            <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50 p-1.5">
              <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Projects in {currentWorkspace.name}
              </div>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition ${
                    proj.id === currentProject.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <div className="truncate">
                    <div className="truncate">{proj.name}</div>
                    <div className="text-xs text-slate-400 font-normal">{proj.key}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sprint Dropdown */}
          <div className="relative group hidden lg:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition text-sm font-medium text-slate-700">
              <span className="text-xs uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                {currentSprint.status}
              </span>
              <span className="max-w-[150px] truncate">{currentSprint.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50 p-1.5">
              <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sprints
              </div>
              {sprints.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSprint(s)}
                  className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition ${
                    s.id === currentSprint.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{s.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'planned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">
                      {s.startDate} to {s.endDate}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: Search input */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title, key (MIG-101), or tag..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
            />
          </div>
        </div>

        {/* Right Section: AI Insights, Team, New Task */}
        <div className="flex items-center gap-2">
          {/* AI Sprint Insights button */}
          <button
            onClick={onOpenAIInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Sprint Coach</span>
          </button>

          {/* Team directory */}
          <button
            onClick={onOpenTeamDirectory}
            title="Team & Workload"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold">{members.length}</span>
          </button>

          {/* New Task button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Current User Avatar */}
          <div className="flex items-center gap-2">
            <img
              src={members[0]?.avatar}
              alt={members[0]?.name}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Second Bar: View Mode Switcher & Sprint goal summary */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-12 bg-slate-50/80 border-t border-slate-200 text-sm">
        {/* View Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeView('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition ${
              activeView === 'board'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => onChangeView('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition ${
              activeView === 'timeline'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Gantt Timeline</span>
          </button>

          <button
            onClick={() => onChangeView('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition ${
              activeView === 'table'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Table View</span>
          </button>

          <button
            onClick={() => onChangeView('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition ${
              activeView === 'analytics'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sprint Analytics</span>
          </button>
        </div>

        {/* Sprint Goal banner */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 max-w-xl truncate">
          <span className="font-semibold text-slate-800 shrink-0">Sprint Goal:</span>
          <span className="truncate">{currentSprint.goal}</span>
        </div>
      </div>
    </header>
  );
};
