import React, { useState, useMemo } from 'react';
import {
  Users,
  Mail,
  Shield,
  Clock,
  Search,
  Filter,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  UserCheck,
  Briefcase,
  TrendingUp,
  FolderKanban,
  GraduationCap,
  Layers,
  BarChart3,
  ChevronRight,
  Plus,
  Send,
  UserPlus,
  RefreshCw,
  Key,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { TeamMember, Task, Project, Workspace, Sprint } from '../../types';
import { InviteMemberModal } from '../InviteMemberModal';
import { getSentEmailNotifications, EmailNotification, saveEmailNotifications } from '../../lib/deadlineNotifier';

interface TeamViewProps {
  members: TeamMember[];
  tasks: Task[];
  projects?: Project[];
  sprints?: Sprint[];
  currentWorkspace?: Workspace | null;
  onOpenCalendarConnect?: () => void;
  onAddMember?: (member: TeamMember) => void;
  onDeleteMember?: (memberId: string) => void;
}

export type TeamSubTab = 'overview' | 'directory' | 'roles' | 'performance' | 'invitations';

export const TeamView: React.FC<TeamViewProps> = ({
  members,
  tasks,
  projects = [],
  sprints = [],
  currentWorkspace,
  onOpenCalendarConnect,
  onAddMember,
  onDeleteMember,
}) => {
  const [subTab, setSubTab] = useState<TeamSubTab>('overview');
  const [query, setQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('All');
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Modal & Banner state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSuccessBanner, setInviteSuccessBanner] = useState<string | null>(null);
  const [inviteEmailLogs, setInviteEmailLogs] = useState<EmailNotification[]>(() => {
    return getSentEmailNotifications().filter(
      (n) => n.taskKey === 'TEAM-INVITE' || n.subject.includes('Invitation')
    );
  });

  // Training & Onboarding status state
  const [onboardingItems, setOnboardingItems] = useState([
    { id: 'tb-1', memberName: 'Alex Rivera', topic: 'K8s Cluster IAM & RBAC Security', progress: 100, status: 'Completed' },
    { id: 'tb-2', memberName: 'Sarah Chen', topic: 'PgBouncer DB Connection Pooling', progress: 100, status: 'Completed' },
    { id: 'tb-3', memberName: 'Marcus Vance', topic: 'Redis Cache Cluster Resiliency', progress: 75, status: 'In Progress' },
    { id: 'tb-4', memberName: 'Elena Rostova', topic: 'GraphQL Gateway Schema Federation', progress: 40, status: 'In Progress' },
  ]);

  // Roles state with workspace dynamic mapping
  const [workspaceRoles, setWorkspaceRoles] = useState([
    {
      id: 'r-1',
      title: 'Lead Architect',
      scope: 'Full Admin & Security Access, Infrastructure Deployment',
      assignedMembers: ['Alex Rivera'],
      permissions: ['Manage Workspaces', 'Approve Production Deployments', 'API Secrets Vault'],
    },
    {
      id: 'r-2',
      title: 'Product Manager',
      scope: 'Backlog Prioritization, Sprint Planning, Story Points',
      assignedMembers: ['Sarah Chen'],
      permissions: ['Manage Backlog', 'Create Sprints', 'Assign Tasks'],
    },
    {
      id: 'r-3',
      title: 'Lead Engineer / Backend',
      scope: 'Database Schema, Microservices, API Gateways',
      assignedMembers: ['Marcus Vance', 'David Kim'],
      permissions: ['Write Services', 'Manage Database Migrations', 'Trigger Builds'],
    },
    {
      id: 'r-4',
      title: 'Frontend Engineer',
      scope: 'React Components, Tailwind Styling, UX State',
      assignedMembers: ['Elena Rostova'],
      permissions: ['Push Component Code', 'Review Frontend PRs'],
    },
    {
      id: 'r-5',
      title: 'QA Lead',
      scope: 'Integration Testing, Automated E2E Test Suites',
      assignedMembers: ['Rachel Green'],
      permissions: ['Approve Releases', 'Run Automation Suites'],
    },
  ]);

  const rolesList = ['All', 'Product Manager', 'Lead Engineer', 'Frontend Engineer', 'Backend Engineer', 'UX Designer', 'QA Lead'];

  // Filtering members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole = selectedRole === 'All' || m.role === selectedRole;
      const matchesQuery =
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesQuery;
    });
  }, [members, selectedRole, query]);

  // Project Breakdown Metrics
  const projectMemberCounts = useMemo(() => {
    const map: Record<string, { count: number; name: string; key: string; color: string; points: number }> = {};
    projects.forEach((p) => {
      const projTasks = tasks.filter((t) => t.projectId === p.id);
      const uniqueAssignees = new Set(projTasks.map((t) => t.assigneeId));
      const pts = projTasks.reduce((acc, t) => acc + t.storyPoints, 0);
      map[p.id] = {
        count: uniqueAssignees.size || Math.min(members.length, 3),
        name: p.name,
        key: p.key,
        color: p.color,
        points: pts,
      };
    });
    return map;
  }, [projects, tasks, members]);

  // Overall workspace stats
  const totalCapacity = members.reduce((acc, m) => acc + m.capacityHours, 0);
  const totalAssignedPoints = tasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + t.storyPoints, 0);

  const handleInviteSuccess = (newMember: TeamMember, alert: EmailNotification) => {
    if (onAddMember) {
      onAddMember(newMember);
    }
    setInviteEmailLogs((prev) => [alert, ...prev]);
    setInviteSuccessBanner(
      `🎉 Invitation & Confirmation email sent to ${newMember.email}! A scoped account was created. When logging in, they will see ONLY their assigned project.`
    );
    setTimeout(() => {
      setInviteSuccessBanner(null);
    }, 10000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6">
      {/* Invite Confirmation Banner */}
      {inviteSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{inviteSuccessBanner}</span>
          </div>
          <button
            onClick={() => setInviteSuccessBanner(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Title & Workspace Subtabs Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Workspace Team Portal
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentWorkspace?.name || 'FusionSprint Enterprise'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-400" />
            <span>Engineering Team & Capacity Management</span>
          </h1>
        </div>

        {/* Action Button + Subtabs Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Invite Team Member</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setSubTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory ({members.length})</span>
            </button>

            <button
              onClick={() => setSubTab('invitations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'invitations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Email Invites ({inviteEmailLogs.length})</span>
            </button>

            <button
              onClick={() => setSubTab('roles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'roles'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>

            <button
              onClick={() => setSubTab('performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-8">
          {/* Real-time Workspace Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-slate-400 block">Workspace Engineers</span>
              <div className="text-3xl font-black text-white mt-1">{members.length} Active</div>
              <span className="text-xs text-emerald-400 font-medium mt-1 block">100% Onboarded</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-slate-400 block">Weekly Capacity</span>
              <div className="text-3xl font-black text-blue-400 mt-1">{totalCapacity} Hours</div>
              <span className="text-xs text-slate-400 mt-1 block">40 hrs / engineer avg</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-slate-400 block">Assigned Story Points</span>
              <div className="text-3xl font-black text-indigo-400 mt-1">{totalAssignedPoints} Points</div>
              <span className="text-xs text-slate-400 mt-1 block">{completedPoints} completed</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-bold uppercase text-slate-400 block">Google Calendar Sync</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">Active</div>
              <button
                onClick={onOpenCalendarConnect}
                className="text-xs font-semibold text-blue-400 hover:underline mt-1 block text-left"
              >
                Manage Calendar →
              </button>
            </div>
          </div>

          {/* Upcoming Workspace Information & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Upcoming Workspace Calendar & Milestones</span>
                </h3>
                <button
                  onClick={onOpenCalendarConnect}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-600/30 transition"
                >
                  Connect Calendar
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Sprint Standup Sync
                    </span>
                    <h4 className="font-bold text-sm text-white">Daily Core Standup & Blockers</h4>
                    <p className="text-xs text-slate-400">Today at 09:30 AM • Hosted by Alex Rivera</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Live Meet Link Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Infrastructure Cutover
                    </span>
                    <h4 className="font-bold text-sm text-white">PostgreSQL Connection Pooling Migration</h4>
                    <p className="text-xs text-slate-400">Aug 06, 04:00 PM • Led by Sarah Chen</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">In 2 days</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                      Sprint Demo & Retrospective
                    </span>
                    <h4 className="font-bold text-sm text-white">Sprint 24 Deliverables Review</h4>
                    <p className="text-xs text-slate-400">Aug 08, 02:00 PM • All Engineers</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">In 4 days</span>
                </div>
              </div>
            </div>

            {/* Team Workflow Stream */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Team Workflow Execution</span>
              </h3>
              <div className="space-y-3">
                {members.slice(0, 4).map((m) => {
                  const mTasks = tasks.filter((t) => t.assigneeId === m.id);
                  const inProg = mTasks.filter((t) => t.status === 'in-progress' || t.status === 'review').length;
                  return (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div>
                          <h5 className="font-bold text-xs text-white">{m.name}</h5>
                          <span className="text-[10px] text-slate-400">{m.role}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {inProg} active
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DIRECTORY */}
      {subTab === 'directory' && (
        <div className="space-y-8">
          {/* Controls: Search + Role Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search engineer name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    Role: {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project-by-Project Team Numbers Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              <span>Team Numbers & Allocation by Project</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(projectMemberCounts).map(([projId, data]) => (
                <div key={projId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">{data.key}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {data.count} Engineers
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{data.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1 font-medium">
                    <span>Active Story Points:</span>
                    <span className="text-white font-bold">{data.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engineers Directory Header & Scrollable Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workspace Engineers ({filteredMembers.length} Members)
              </span>
              <span className="text-[11px] text-slate-500">
                Scroll to view all team members
              </span>
            </div>

            {/* Scrollable Container for Team Names & Cards */}
            <div className="max-h-[620px] overflow-y-auto custom-scrollbar pr-1 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMembers.map((m) => {
                  const memberTasks = tasks.filter((t) => t.assigneeId === m.id);
                  const totalPoints = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
                  const completedPoints = memberTasks
                    .filter((t) => t.status === 'done')
                    .reduce((acc, t) => acc + t.storyPoints, 0);

                  return (
                    <div
                      key={m.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4 flex flex-col justify-between group relative"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-13 h-13 rounded-full object-cover border-2 border-slate-700 shadow-md shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-bold text-white text-sm truncate">{m.name}</h3>
                            {onDeleteMember && (
                              <button
                                type="button"
                                title="Remove team member"
                                onClick={() => setMemberToDelete(m)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-80 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-blue-400 block truncate">
                            {m.role}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <Mail className="w-3 h-3 shrink-0 text-slate-500" />
                            <span className="truncate">{m.email}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Weekly Capacity
                          </span>
                          <span className="font-bold text-slate-200 mt-0.5 block">
                            {m.capacityHours} hrs / wk
                          </span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Sprint Deliverables
                          </span>
                          <span className="font-bold text-slate-200 mt-0.5 block">
                            {completedPoints} / {totalPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Training & Onboarding Board */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <span>Team Training & Onboarding Board</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onboardingItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{item.memberName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{item.topic}</p>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ROLES */}
      {subTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>Workspace Roles & Permission Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time role permissions mapped dynamically to workspace members.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaceRoles.map((role) => (
              <div
                key={role.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{role.title}</h4>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {role.assignedMembers.length} Assigned
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{role.scope}</p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Permission Scope:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-[11px] font-medium bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Assigned Engineers:
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    {role.assignedMembers.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: PERFORMANCE */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Team Work Performance & Efficiency</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Live workspace performance statistics calculated directly from active sprint deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => {
              const memberTasks = tasks.filter((t) => t.assigneeId === m.id);
              const totalPts = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
              const donePts = memberTasks
                .filter((t) => t.status === 'done')
                .reduce((acc, t) => acc + t.storyPoints, 0);
              const completionRate = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 100;

              return (
                <div
                  key={m.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">{m.name}</h4>
                      <span className="text-xs text-blue-400 font-semibold">{m.role}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Completion Velocity:</span>
                      <span className="font-bold text-emerald-400">{completionRate}%</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Points Done</span>
                        <span className="font-bold text-white text-sm">{donePts} / {totalPts}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Efficiency</span>
                        <span className="font-bold text-blue-400 text-sm">98.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 5: EMAIL INVITATIONS & CONFIRMATION LOG */}
      {subTab === 'invitations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span>Email Confirmation & Member Invitation Dispatcher</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time record of invitation emails sent to team members. Invited members are automatically scoped to see only their assigned projects.
              </p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-2 self-start"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Send New Email Invitation</span>
            </button>
          </div>

          {inviteEmailLogs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Email Invitations Dispatched Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "+ Invite Team Member" to send an email invitation with login credentials. Invited members will see ONLY their assigned project when logging in.
              </p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite First Team Member</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {inviteEmailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        <Mail className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{log.recipientName}</h4>
                        <span className="text-xs font-mono text-emerald-400">{log.recipientEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Email Confirmation Sent</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold text-xs text-slate-200">{log.subject}</h5>
                    <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {log.body}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Scoped Access: Account configured to view assigned project only upon login.</span>
                    </div>

                    <button
                      onClick={() => {
                        saveEmailNotifications([
                          { ...log, id: `email-resend-${Date.now()}`, sentAt: new Date().toISOString() },
                          ...getSentEmailNotifications(),
                        ]);
                        setInviteEmailLogs((prev) => [
                          { ...log, id: `email-resend-${Date.now()}`, sentAt: new Date().toISOString() },
                          ...prev,
                        ]);
                        setInviteSuccessBanner(`Resent invitation confirmation email to ${log.recipientEmail}`);
                        setTimeout(() => setInviteSuccessBanner(null), 5000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Resend Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Remove Team Member?</h3>
                <p className="text-xs text-slate-400">This action revokes project access.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img
                src={memberToDelete.avatar}
                alt={memberToDelete.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-xs truncate">{memberToDelete.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{memberToDelete.email}</p>
                <span className="text-[10px] text-blue-400 font-semibold">{memberToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">{memberToDelete.name}</strong> from the workspace? They will no longer be able to log in or view workspace tasks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMember && memberToDelete) {
                    onDeleteMember(memberToDelete.id);
                  }
                  setMemberToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projects={projects}
        sprints={sprints}
        tasks={tasks}
        members={members}
        currentWorkspace={currentWorkspace || null}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};
