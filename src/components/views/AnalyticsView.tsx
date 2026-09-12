import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Sparkles, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Task, Sprint, TeamMember } from '../../types';

interface AnalyticsViewProps {
  tasks: Task[];
  sprint: Sprint;
  members: TeamMember[];
  onOpenAIInsights: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  sprint,
  members,
  onOpenAIInsights,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress' || t.status === 'review');
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent');

  const totalPoints = tasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = completedTasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const velocityPct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Data for Story points by status (Pie chart)
  const statusCounts = [
    { name: 'Done', value: tasks.filter((t) => t.status === 'done').reduce((a, b) => a + b.storyPoints, 0), color: '#10b981' },
    { name: 'Review', value: tasks.filter((t) => t.status === 'review').reduce((a, b) => a + b.storyPoints, 0), color: '#a855f7' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').reduce((a, b) => a + b.storyPoints, 0), color: '#f59e0b' },
    { name: 'To Do', value: tasks.filter((t) => t.status === 'todo').reduce((a, b) => a + b.storyPoints, 0), color: '#3b82f6' },
    { name: 'Backlog', value: tasks.filter((t) => t.status === 'backlog').reduce((a, b) => a + b.storyPoints, 0), color: '#64748b' },
  ].filter((item) => item.value > 0);

  // Data for Story points by assignee (Bar chart)
  const assigneeData = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === m.id);
    const assigned = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
    const completed = memberTasks.filter((t) => t.status === 'done').reduce((acc, t) => acc + t.storyPoints, 0);
    return {
      name: m.name.split(' ')[0],
      assigned,
      completed,
    };
  });

  // Simulated 14-day Sprint Burndown Data
  const burndownData = [
    { day: 'Day 1', ideal: 60, actual: 60 },
    { day: 'Day 3', ideal: 51, actual: 54 },
    { day: 'Day 5', ideal: 42, actual: 45 },
    { day: 'Day 7', ideal: 34, actual: 35 },
    { day: 'Day 9', ideal: 25, actual: 28 },
    { day: 'Day 11', ideal: 17, actual: 19 },
    { day: 'Day 13', ideal: 8, actual: totalPoints - completedPoints },
    { day: 'Day 14', ideal: 0, actual: totalPoints - completedPoints },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/70 min-h-[calc(100vh-112px)]">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sprint Velocity
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {velocityPct}%
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {completedPoints} / {totalPoints} story points done
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed Tasks
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {completedTasks.length} / {totalTasks}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {inProgressTasks.length} tasks actively moving
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Urgent & High Priority
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {urgentTasks.length} urgent
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Needs attention to prevent spillover
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={onOpenAIInsights}
            className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-2xl border border-violet-500/30 shadow-xs flex items-center justify-between text-white cursor-pointer hover:brightness-105 transition group"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-200">
                AI Risk Assessment
              </p>
              <h3 className="text-2xl font-black mt-1">88 / 100</h3>
              <p className="text-xs text-violet-200 mt-1 underline group-hover:text-white">
                View automated bottleneck analysis
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Row 1: Burndown Chart & Story Points by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Sprint Burndown Trajectory
                </h3>
                <p className="text-xs text-slate-500">
                  Ideal burndown vs. actual remaining story points
                </p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                14-Day Sprint
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ideal"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    name="Ideal Remaining"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Actual Remaining Points"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Status Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Story Point Allocation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown by current task status
            </p>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {statusCounts.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
              {statusCounts.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>
                    {s.name} ({s.value}p)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Team Member Workload & Story Point Completion */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Team Workload & Velocity by Member
              </h3>
              <p className="text-xs text-slate-500">
                Assigned story points vs. completed story points per engineer
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" name="Assigned Points" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed Points" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
