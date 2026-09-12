import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Activity,
  UserCheck,
  Plus,
  RefreshCw,
  FileText,
  CalendarDays,
  Percent,
} from 'lucide-react';
import { Project, Task, TeamMember, Sprint, ProjectStatsOut, ActivityLog } from '../../types';
import { fetchProjectStats, fetchProjectActivity } from '../../lib/api';

interface ProjectOverviewSubViewProps {
  projects: Project[];
  currentProject?: Project | null;
  onSelectProject: (p: Project) => void;
  tasks: Task[];
  members: TeamMember[];
  sprints: Sprint[];
  onOpenNewTask: () => void;
  onOpenAIInsights: () => void;
}

export const ProjectOverviewSubView: React.FC<ProjectOverviewSubViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  tasks,
  members,
  sprints,
  onOpenNewTask,
  onOpenAIInsights,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    currentProject?.id || projects[0]?.id || ''
  );
  const [stats, setStats] = useState<ProjectStatsOut | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync selected project ID if currentProject changes from outside
  useEffect(() => {
    if (currentProject?.id) {
      setSelectedProjectId(currentProject.id);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [currentProject?.id, projects, selectedProjectId]);

  const inspectedProject = useMemo(() => {
    return (
      projects.find((p) => p.id === selectedProjectId) ||
      currentProject ||
      projects[0] || null
    );
  }, [projects, selectedProjectId, currentProject]);

  // Load stats & activities for selected project
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (!inspectedProject?.id || !inspectedProject.workspaceId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          fetchProjectStats(inspectedProject.id, inspectedProject.workspaceId),
          fetchProjectActivity(inspectedProject.id, inspectedProject.workspaceId),
        ]);
        if (isMounted) {
          setStats(statsData);
          setActivities(activityData);
        }
      } catch (e) {
        console.error('Error fetching project overview data:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [inspectedProject?.id, inspectedProject?.workspaceId, tasks]);

  // Compute fallback display values from local tasks if needed
  const projectTasks = useMemo(() => {
    if (!inspectedProject?.id) return [];
    return tasks.filter((t) => t.projectId === inspectedProject.id);
  }, [tasks, inspectedProject?.id]);

  const totalCount = stats?.task_count ?? projectTasks.length;
  const completedCount =
    stats?.completed_task_count ??
    projectTasks.filter((t) => t.is_completed || t.status === 'done').length;
  const overdueCount = stats?.overdue_task_count ?? 0;
  const healthScore = stats?.health_score ?? (totalCount ? Math.round((completedCount / totalCount) * 100) : 0);
  const riskLevel = stats?.risk_level ?? 'Low';
  const riskReason = stats?.risk_reason ?? (totalCount ? 'Calculated from live task completion.' : 'No live tasks to assess yet.');

  // Overall progress percentage
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : inspectedProject?.progress || 0;

  // Health Score Color Helpers
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: '#10b981', label: 'Healthy & On Track' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: '#f59e0b', label: 'Needs Attention' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', ring: '#f43f5e', label: 'Critical Risk' };
  };

  const healthMeta = getHealthScoreColor(healthScore);

  // Risk Badge Color Helpers
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return {
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          label: 'High Risk',
        };
      case 'Medium':
        return {
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'Medium Risk',
        };
      default:
        return {
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          label: 'Low Risk',
        };
    }
  };

  const riskMeta = getRiskBadge(riskLevel);

  // Workload Status Helper
  const getWorkloadStatusStyle = (status: string) => {
    switch (status) {
      case 'Overloaded':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'At Capacity':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Steady':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getWorkloadBarColor = (pct: number) => {
    if (pct > 109) return 'bg-rose-500';
    if (pct >= 85) return 'bg-amber-500';
    if (pct >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 space-y-6" id="project-overview-container">
      {/* Top Banner & Project Switcher */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Project Overview Dashboard
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${riskMeta.badgeClass}`}>
              {riskMeta.icon}
              <span>{riskMeta.label}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 pt-1">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            <span>{inspectedProject.name}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            {inspectedProject.description}
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Project Selector
            </label>
            <div className="relative">
              <select
                id="project-overview-selector"
                value={inspectedProject.id}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) {
                    setSelectedProjectId(found.id);
                    onSelectProject(found);
                  }
                }}
                className="w-full sm:w-56 px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-lg appearance-none"
              >
                {projects.length === 0 ? (
                  <option value={inspectedProject.id} className="bg-slate-900 text-white">
                    {inspectedProject.key} - {inspectedProject.name}
                  </option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.key} - {p.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-4">
            <button
              onClick={onOpenNewTask}
              id="overview-btn-create-task"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
            <button
              onClick={onOpenAIInsights}
              id="overview-btn-ai-insights"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Health Score & Risk Level | Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module 1: Project Health Score Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Project Health Score</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Composite metric (Completion 40%, On-Time 25%, Recency 20%, Workload 15%)
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${healthMeta.bg} ${healthMeta.text} ${healthMeta.border}`}>
              {healthMeta.label}
            </span>
          </div>

          {/* Main Score Display */}
          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-slate-950/80 border-4 border-slate-800 shadow-inner">
              {/* Radial Score */}
              <div className="text-center">
                <span className={`text-4xl font-black font-mono tracking-tight ${healthMeta.text}`}>
                  {healthScore}
                </span>
                <span className="block text-xs font-bold text-slate-400 font-mono">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Risk Level Callout inside Health Card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${healthMeta.bg} ${healthMeta.border}`}>
            <div className="mt-0.5">{riskMeta.icon}</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Risk Level:</span>
                <span className={`text-xs font-extrabold ${riskMeta.badgeClass} px-2 py-0.5 rounded-md border`}>
                  {riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {riskReason}
              </p>
            </div>
          </div>

          {/* Health Formula Weights Legend */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] text-center font-mono">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Completion</span>
              <span className="font-bold text-indigo-300">40%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">On-Time</span>
              <span className="font-bold text-emerald-300">25%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Recency</span>
              <span className="font-bold text-blue-300">20%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Workload</span>
              <span className="font-bold text-amber-300">15%</span>
            </div>
          </div>
        </div>

        {/* Module 2: Overall Progress & Key Statistics (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Overall Project Progress</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time deliverable completion status across all milestones & sprints.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {progressPercent}%
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({completedCount} of {totalCount} completed)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0% Initiated</span>
                <span>Completed Tasks: {completedCount} / {totalCount}</span>
                <span>100% Target</span>
              </div>
            </div>
          </div>

          {/* 4 Cards Stats Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Total Tasks</span>
                <Layers className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{totalCount}</p>
              <p className="text-[10px] text-slate-500">All sprint items</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Completed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{completedCount}</p>
              <p className="text-[10px] text-slate-500">Marked as done</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Overdue Tasks</span>
                <Clock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className={`text-2xl font-black font-mono ${overdueCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {overdueCount}
              </p>
              <p className="text-[10px] text-slate-500">Past target due date</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Contributors</span>
                <Users className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats?.member_count ?? members.length}</p>
              <p className="text-[10px] text-slate-500">Assigned members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Roadmap / Milestone Phases & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module 3: Project Roadmap (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Project Roadmap & Milestones</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {stats?.roadmap?.length ?? 0} Milestones
            </span>
          </div>

          <div className="space-y-3">
            {stats?.roadmap && stats.roadmap.length > 0 ? (
              stats.roadmap.map((phase) => (
                <div
                  key={phase.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {phase.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        phase.percent_complete === 100
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : phase.percent_complete > 0
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {phase.status_label || (phase.percent_complete === 100 ? 'Completed' : phase.percent_complete > 0 ? 'In Progress' : 'Planned')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{phase.start_time} to {phase.end_time}</span>
                      </span>
                      <span className="font-bold text-slate-300">{phase.percent_complete}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          phase.percent_complete === 100
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${phase.percent_complete}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No roadmap milestones currently configured for this project.
              </div>
            )}
          </div>
        </div>

        {/* Module 4: Team Workload (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Team Workload Distribution</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {stats?.team_workload?.length ?? members.length} Members
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {stats?.team_workload && stats.team_workload.length > 0 ? (
              stats.team_workload.map((member) => (
                <div
                  key={member.user_id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.full_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {member.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{member.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-300">
                        {member.open_task_count} open task{member.open_task_count === 1 ? '' : 's'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getWorkloadStatusStyle(
                          member.status_label
                        )}`}
                      >
                        {member.status_label}
                      </span>
                    </div>
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Capacity Allocation</span>
                      <span className="font-bold text-slate-300">{member.workload_percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getWorkloadBarColor(
                          member.workload_percent
                        )}`}
                        style={{ width: `${Math.min(100, member.workload_percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              members.map((m) => {
                const count = projectTasks.filter((t) => t.assigneeId === m.id && !t.is_completed && t.status !== 'done').length;
                const pct = Math.round((count / 8) * 100);
                const statusLabel = pct < 50 ? 'Available' : pct <= 84 ? 'Steady' : pct <= 109 ? 'At Capacity' : 'Overloaded';
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-300">{count} open</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getWorkloadStatusStyle(statusLabel)}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid Row 3: Recent Activity Log */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Recent Project Activity</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {activities.length} Recorded Actions
          </span>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {activities.length > 0 ? (
            activities.slice(0, 10).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    {act.taskKey || 'PRJ'}
                  </span>
                  <span className="text-xs text-slate-300">{act.description}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  {act.timestamp}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No recent activity recorded for this project yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
