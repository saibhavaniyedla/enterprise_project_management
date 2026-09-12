import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderKanban,
  CheckCircle2,
  Plus,
  Layers,
  ChevronRight,
  Clock,
  Users,
  Search,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock,
  Archive,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Project, Sprint, Task, TeamMember, Workspace, TaskStatus } from '../../types';
import { getAutoArchiveLogs } from '../../lib/sprintAutoArchive';

interface DashboardViewProps {
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
  members: TeamMember[];
  workspaces?: Workspace[];
  currentWorkspace?: Workspace | null;
  currentProject?: Project | null;
  currentSprint?: Sprint | null;
  isWorkspaceUnlocked?: boolean;
  onNavigateTab: (tab: any) => void;
  onOpenNewTask: () => void;
  onOpenAIInsights?: () => void;
  onSelectProject: (p: Project) => void;
  onSelectWorkspace?: (w: Workspace) => void;
  onSelectSprint?: (s: Sprint) => void;
  onSelectTask?: (t: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenNewTaskWithStatus?: (status: TaskStatus) => void;
  onCreateWorkspace?: (name: string, desc: string) => void;
  onCreateProject?: (name: string, key: string, desc: string, workspaceId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  sprints,
  tasks,
  members,
  workspaces = [],
  currentWorkspace,
  currentProject,
  currentSprint,
  isWorkspaceUnlocked = false,
  onNavigateTab,
  onOpenNewTask,
  onOpenAIInsights,
  onSelectProject,
  onSelectWorkspace,
  onSelectSprint,
  onSelectTask,
  onStatusChange,
  onDeleteTask,
  onOpenNewTaskWithStatus,
  onCreateWorkspace,
  onCreateProject,
}) => {
  const [archiveLogs, setArchiveLogs] = useState<string[]>([]);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');

  const [isNewProjModalOpen, setIsNewProjModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Load auto archive logs
  useEffect(() => {
    const updateLogs = () => setArchiveLogs(getAutoArchiveLogs());
    updateLogs();
    const handleArchived = () => updateLogs();
    window.addEventListener('sprints_auto_archived', handleArchived);
    return () => window.removeEventListener('sprints_auto_archived', handleArchived);
  }, []);

  const activeWsList = workspaces.length > 0 ? workspaces : [];
  const activeWs = currentWorkspace || activeWsList[0] || null;

  // Filter projects for the currently selected workspace
  const workspaceProjects = activeWs
    ? projects.filter((p) => p.workspaceId === activeWs.id || !p.workspaceId)
    : projects;

  const activeProj = currentProject || workspaceProjects[0] || null;

  // Filter tasks for active project
  const projectTasks = activeProj ? tasks.filter((t) => t.projectId === activeProj.id) : [];

  const handleCreateWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    if (onCreateWorkspace) {
      onCreateWorkspace(newWsName.trim(), newWsDesc.trim() || 'Custom Team Workspace');
    }
    setNewWsName('');
    setNewWsDesc('');
    setIsNewWsModalOpen(false);
  };

  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjKey.trim() || !activeWs) return;
    if (onCreateProject) {
      onCreateProject(
        newProjName.trim(),
        newProjKey.trim().toUpperCase(),
        newProjDesc.trim() || 'Engineering Project',
        activeWs.id
      );
    }
    setNewProjName('');
    setNewProjKey('');
    setNewProjDesc('');
    setIsNewProjModalOpen(false);
  };

  const handleEnterWorkspace = (ws: Workspace) => {
    if (onSelectWorkspace) {
      onSelectWorkspace(ws);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 space-y-8 min-h-[calc(100vh-64px)] font-sans">
      {/* Top Banner: Workspace Unlock Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              {isWorkspaceUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Workspace Active & Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select a Workspace to Unlock Full App</span>
                </>
              )}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-400" />
            <span>{activeWs ? activeWs.name : 'Workspace Control Center'}</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl">
            {isWorkspaceUnlocked
              ? `Real-time management for ${activeWs?.name}. All sprint boards, team roles, developer hubs, and analytics tabs are unlocked.`
              : 'Welcome! Choose an active workspace below to open your project boards, sprint workflows, and team tools.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsNewWsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Workspace</span>
          </button>

          {isWorkspaceUnlocked && (
            <button
              onClick={() => onNavigateTab('projects')}
              className="px-4 py-2.5 rounded-2xl bg-violet-600/30 hover:bg-violet-600/40 border border-violet-500/40 text-violet-300 font-extrabold text-xs flex items-center gap-2 transition"
            >
              <span>Go to Sprint Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Auto-Archive Background Service Telemetry Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">Sprint Auto-Archiver Service</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active (Auto-Rollover)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automatically archives expired sprints and rolls unfinished tasks to the next active sprint.
            </p>
          </div>
        </div>

        {archiveLogs.length > 0 && (
          <div className="text-[11px] font-mono text-violet-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 truncate max-w-md">
            Last Event: {archiveLogs[0]}
          </div>
        )}
      </div>

      {/* SECTION 1: Workspace Selection & Management Hub */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Select Workspace to Open</h2>
              <p className="text-xs text-slate-400">
                Click "Enter Workspace" to open projects and unlock all navigation tabs in the sidebar.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewWsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Workspace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWsList.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <Building2 className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No custom workspaces found yet.</p>
              <button
                onClick={() => setIsNewWsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                + Create Your First Workspace
              </button>
            </div>
          ) : (
            activeWsList.map((ws) => {
              const isCurrent = activeWs?.id === ws.id;
              const wsProjCount = projects.filter((p) => p.workspaceId === ws.id).length;

              return (
                <div
                  key={ws.id}
                  className={`p-5 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                    isCurrent && isWorkspaceUnlocked
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white truncate">{ws.name}</span>
                      {isCurrent && isWorkspaceUnlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {wsProjCount} Projects
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ws.description || 'Enterprise Workspace Platform'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleEnterWorkspace(ws)}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                      isCurrent && isWorkspaceUnlocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {isCurrent && isWorkspaceUnlocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Workspace Opened (Tabs Unlocked)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Enter Workspace & Unlock Tabs</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: Workspace Projects & Sprint Deliverables (Shown when workspace unlocked or active) */}
      {activeWs && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  Projects in {activeWs.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Select a project to view tasks, or create a new project for this workspace.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNewProjModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>

              <button
                onClick={onOpenNewTask}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-violet-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceProjects.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <FolderKanban className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No projects in this workspace yet.</p>
                <button
                  onClick={() => setIsNewProjModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  + Add Project to {activeWs.name}
                </button>
              </div>
            ) : (
              workspaceProjects.map((proj) => {
                const isSelected = activeProj?.id === proj.id;
                const pTasks = tasks.filter((t) => t.projectId === proj.id);
                const doneCount = pTasks.filter((t) => t.status === 'done').length;

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      if (!isWorkspaceUnlocked && onSelectWorkspace) {
                        onSelectWorkspace(activeWs);
                      }
                    }}
                    className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        [{proj.key}]
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {doneCount}/{pTasks.length} Completed
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-sm">{proj.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{pTasks.length} Total Tasks</span>
                      <span className="text-indigo-300 font-bold flex items-center gap-1">
                        View Board <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tasks Overview for Selected Project */}
          {activeProj && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Tasks in {activeProj.name}</span>
                </h3>

                <button
                  onClick={() => onNavigateTab('projects')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Open Full Sprint Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                    No tasks created in {activeProj.name} yet. Click "+ Create Task" above to add deliverables!
                  </div>
                ) : (
                  projectTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask && onSelectTask(t)}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-indigo-400 shrink-0">
                          {t.key}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{t.title}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300">
                          {t.status}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Workspace */}
      {isNewWsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Create New Workspace</h3>
              <button
                onClick={() => setIsNewWsModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWs} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Workspace Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Mobile Engineering"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  placeholder="Overview of this workspace's purpose..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-md"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Project */}
      {isNewProjModalOpen && activeWs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Create Project in {activeWs.name}</h3>
              <button
                onClick={() => setIsNewProjModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProj} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud SQL Infrastructure"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Project Key (Prefix) *</label>
                <input
                  type="text"
                  placeholder="e.g. MIG or CLOUD"
                  value={newProjKey}
                  onChange={(e) => setNewProjKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  placeholder="Brief project goals..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
