import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Sprint, TeamMember } from '../../types';

interface TimelineViewProps { tasks: Task[]; sprint?: Sprint | null; members: TeamMember[]; onSelectTask: (task: Task) => void; }
const DAY = 86_400_000;
const day = (value?: string) => { const parsed = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : null; return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null; };
const iso = (value: Date) => value.toISOString().slice(0, 10);

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, sprint, members, onSelectTask }) => {
  const [offset, setOffset] = useState(0);
  const range = useMemo(() => {
    const dated = tasks.flatMap(t => [day(t.startDate), day(t.dueDate)]).filter(Boolean) as Date[];
    const anchor = day(sprint?.startDate) || dated.sort((a, b) => a.getTime() - b.getTime())[0] || new Date();
    const end = day(sprint?.endDate) || dated.sort((a, b) => b.getTime() - a.getTime())[0] || new Date(anchor.getTime() + 13 * DAY);
    const span = Math.max(14, Math.ceil((end.getTime() - anchor.getTime()) / DAY) + 1);
    const start = new Date(anchor.getTime() + offset * DAY);
    return { start, columns: Array.from({ length: Math.min(31, span) }, (_, i) => new Date(start.getTime() + i * DAY)) };
  }, [tasks, sprint?.startDate, sprint?.endDate, offset]);
  const colors: Record<string, string> = { Urgent: 'bg-rose-500', High: 'bg-amber-500', Medium: 'bg-blue-500', Low: 'bg-slate-400' };
  const position = (task: Task) => { const start = day(task.startDate) || range.start; const end = day(task.dueDate) || start; const left = Math.max(0, Math.floor((start.getTime() - range.start.getTime()) / DAY)); const last = Math.max(left, Math.floor((end.getTime() - range.start.getTime()) / DAY)); return { left: `${(left / range.columns.length) * 100}%`, width: `${Math.max(100 / range.columns.length, ((last - left + 1) / range.columns.length) * 100)}%` }; };
  if (!tasks.length) return <div className="p-8 text-center text-slate-400">No scheduled tasks yet. Create a task with dates to see it on the timeline.</div>;
  return <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/70">
    <div className="flex items-center justify-between mb-3"><div><h2 className="font-bold text-slate-800">{sprint?.name || 'Project timeline'}</h2><p className="text-xs text-slate-500">Live task dates · scroll one day or a month at a time</p></div><div className="flex gap-2"><button className="px-2 py-1 border rounded" onClick={() => setOffset(o => o - 30)}><ChevronLeft className="w-4 h-4" /></button><button className="px-2 py-1 border rounded text-xs" onClick={() => setOffset(0)}>Today / sprint</button><button className="px-2 py-1 border rounded" onClick={() => setOffset(o => o + 30)}><ChevronRight className="w-4 h-4" /></button></div></div>
    <div className="bg-white border rounded-xl min-w-[1050px] overflow-hidden"><div className="flex border-b"><div className="w-72 p-3 text-xs font-bold text-slate-500">TASK / ASSIGNEE</div><div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${range.columns.length}, minmax(36px, 1fr))` }}>{range.columns.map(d => <div key={iso(d)} className="text-center py-2 border-l text-[10px] text-slate-500"><div>{d.toLocaleDateString('en-US', { month: 'short' })}</div><b>{d.getDate()}</b></div>)}</div></div>
      {tasks.map(task => { const assignee = members.find(m => m.id === task.assigneeId); const bar = position(task); return <div key={task.id} className="flex border-b last:border-0"><button onClick={() => onSelectTask(task)} className="w-72 p-3 text-left truncate"><div className="text-xs font-bold text-slate-700">{task.key || 'TASK'} · {task.title || 'Untitled task'}</div><div className="text-[11px] text-slate-400">{assignee?.name || 'Unassigned'} · {task.startDate || 'No start date'} — {task.dueDate || 'No due date'}</div></button><div className="flex-1 relative h-14" style={{ backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px)', backgroundSize: `${100 / range.columns.length}% 100%` }}><button onClick={() => onSelectTask(task)} title={task.title} className={`absolute top-3 h-7 rounded px-2 text-left text-xs text-white truncate ${colors[task.priority] || colors.Medium}`} style={bar}>{task.title || 'Untitled task'}</button></div></div>; })}</div>
  </div>;
};
