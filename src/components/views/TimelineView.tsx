import React, { useMemo } from 'react';
import { Calendar, Clock, AlertCircle, User, ArrowRight } from 'lucide-react';
import { Task, Sprint, TeamMember } from '../../types';

interface TimelineViewProps {
  tasks: Task[];
  sprint?: Sprint | null;
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  sprint,
  members,
  onSelectTask,
}) => {
  const effectiveStartDate = useMemo(() => {
    if (sprint?.startDate) return sprint.startDate;
    return new Date().toISOString().split('T')[0];
  }, [sprint?.startDate]);

  // Generate date range headers for the sprint timeline (14 days)
  const dateColumns = useMemo(() => {
    const dates: string[] = [];
    const start = new Date(effectiveStartDate);
    const validStart = isNaN(start.getTime()) ? new Date() : start;
    for (let i = 0; i < 14; i++) {
      const d = new Date(validStart);
      d.setDate(validStart.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [effectiveStartDate]);

  const priorityColors = {
    Urgent: 'bg-rose-500 border-rose-600',
    High: 'bg-amber-500 border-amber-600',
    Medium: 'bg-blue-500 border-blue-600',
    Low: 'bg-slate-400 border-slate-500',
  };

  const calculateBarPosition = (startDate?: string, dueDate?: string) => {
    const sprintStartDateObj = new Date(effectiveStartDate);
    const sprintStart = isNaN(sprintStartDateObj.getTime())
      ? Date.now()
      : sprintStartDateObj.getTime();

    const rawStart = startDate ? new Date(startDate).getTime() : sprintStart;
    const validStart = isNaN(rawStart) ? sprintStart : rawStart;

    const rawEnd = dueDate ? new Date(dueDate).getTime() : validStart + 86400000;
    const validEnd = isNaN(rawEnd) ? validStart + 86400000 : rawEnd;

    const start = Math.max(validStart, sprintStart);
    const end = Math.max(validEnd, start);
    const dayMs = 86400000;

    const startDayIndex = Math.max(0, Math.floor((start - sprintStart) / dayMs));
    const durationDays = Math.max(1, Math.ceil((end - start) / dayMs) + 1);

    const leftPct = Math.min(94, (startDayIndex / 14) * 100);
    const widthPct = Math.min(100 - leftPct, (durationDays / 14) * 100);

    return { left: `${leftPct}%`, width: `${Math.max(6, widthPct)}%` };
  };

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/70 min-h-[calc(100vh-112px)]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-w-[1000px]">
        {/* Timeline Header Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/80">
          {/* Left Column: Task & Assignee info */}
          <div className="w-72 shrink-0 p-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-r border-slate-200">
            Task / Assignee ({tasks.length})
          </div>

          {/* Right Column: Day Headers */}
          <div className="flex-1 grid grid-cols-14 text-center">
            {dateColumns.map((dateStr, idx) => {
              const d = new Date(dateStr);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`py-2 px-1 border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center ${
                    isToday ? 'bg-blue-50/80 text-blue-800 font-bold' : 'text-slate-600'
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {dayName}
                  </span>
                  <span
                    className={`text-xs mt-0.5 ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        : ''
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Row Items */}
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const assignee = members.find((m) => m.id === task.assigneeId);
            const { left, width } = calculateBarPosition(task.startDate, task.dueDate);

            return (
              <div
                key={task.id}
                className="flex items-center hover:bg-slate-50/80 transition group"
              >
                {/* Left Pane: Task Details */}
                <div
                  onClick={() => onSelectTask(task)}
                  className="w-72 shrink-0 p-3 border-r border-slate-200 flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {assignee ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        title={assignee.name}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        ?
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold font-mono text-slate-500">
                          {task.key}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-xs font-semibold ${
                            task.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'in-progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">
                        {task.title}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {task.storyPoints}p
                  </span>
                </div>

                {/* Right Pane: Gantt Bar Track */}
                <div className="flex-1 relative h-12 flex items-center px-1">
                  {/* Subtle Grid vertical lines */}
                  <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                    {dateColumns.map((_, i) => (
                      <div key={i} className="border-r border-slate-100/60 last:border-r-0" />
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div
                    onClick={() => onSelectTask(task)}
                    className={`absolute h-7 rounded-lg border text-white text-xs font-semibold px-2.5 flex items-center justify-between shadow-xs cursor-pointer hover:brightness-110 transition z-10 truncate ${
                      priorityColors[task.priority] || priorityColors.Medium
                    }`}
                    style={{ left, width }}
                  >
                    <span className="truncate">{task.title}</span>
                    <span className="text-[10px] opacity-90 font-mono ml-1 shrink-0">
                      {task.storyPoints}p
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
