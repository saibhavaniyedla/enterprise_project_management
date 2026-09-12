import React, { useState } from 'react';
import {
  CalendarDays,
  Video,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  Filter,
} from 'lucide-react';
import { Task, TeamMember, Project } from '../../types';

interface ProjectCalendarSubViewProps {
  tasks: Task[];
  members: TeamMember[];
  currentProject: Project;
}

export const ProjectCalendarSubView: React.FC<ProjectCalendarSubViewProps> = ({
  tasks,
  members,
  currentProject,
}) => {
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Sample meetings scheduled for this project
  const [meetings] = useState([
    {
      id: 'm-1',
      title: 'Daily Engineering Standup',
      time: '09:30 AM',
      date: '2026-08-05',
      type: 'standup',
      organizer: 'Alex Rivera',
    },
    {
      id: 'm-2',
      title: 'Cloud SQL Migration Architecture Review',
      time: '02:00 PM',
      date: '2026-08-07',
      type: 'review',
      organizer: 'Sarah Chen',
    },
    {
      id: 'm-3',
      title: 'Sprint Demo & Stakeholder Alignment',
      time: '04:00 PM',
      date: '2026-08-12',
      type: 'demo',
      organizer: 'David Kim',
    },
    {
      id: 'm-4',
      title: 'PostgreSQL Connection Pooling Tech Sync',
      time: '11:00 AM',
      date: '2026-08-14',
      type: 'sync',
      organizer: 'Elena Rostova',
    },
  ]);

  const handleSendTeamReminders = () => {
    setReminderToast(
      `Deadline & Meeting reminders dispatched to all ${members.length} team members (including saibhavaniyedla35@gmail.com, bhargavi@example.com)!`
    );
    setTimeout(() => {
      setReminderToast(null);
    }, 5000);
  };

  // Build August 2026 Grid days (1 to 31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const getEventsForDay = (dayNum: number) => {
    const dayStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;

    // Meetings on day
    const dayMeetings = meetings.filter((m) => m.date === dayStr);

    // Tasks with deadline on day
    const dayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return t.dueDate === dayStr || (dayNum === 6 && t.priority === 'Urgent');
    });

    return { dayMeetings, dayTasks };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Unified Project Schedule & Deadline Dispatcher
            </span>
            <span className="text-xs font-mono text-slate-400">
              Project: {currentProject.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-400" />
            <span>Combined Meetings & Task Deadlines</span>
          </h1>
        </div>

        {/* Action Button: Send Deadline Reminders for all team */}
        <button
          onClick={handleSendTeamReminders}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Send Deadline Reminders to All Team</span>
        </button>
      </div>

      {/* Toast Banner */}
      {reminderToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg animate-fade-in">
          <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Calendar Header Control */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>August 2026</span>
          <span className="text-xs font-mono font-normal text-slate-400">
            ({meetings.length} Scheduled Meetings • {tasks.length} Task Deadlines)
          </span>
        </h2>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span>Meetings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Task Deadlines</span>
          </div>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800 min-w-[700px]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-2 pt-3 min-w-[700px]">
          {/* Offset for August 1, 2026 starting on Saturday (6 blank cells) */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-28 rounded-xl bg-slate-950/30 border border-slate-900/50" />
          ))}

          {daysInMonth.map((dayNum) => {
            const { dayMeetings, dayTasks } = getEventsForDay(dayNum);
            const isToday = dayNum === 5;

            return (
              <div
                key={dayNum}
                className={`h-28 rounded-xl p-2 border transition flex flex-col justify-between overflow-hidden ${
                  isToday
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-indigo-500 text-white' : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase text-indigo-400">
                      Today
                    </span>
                  )}
                </div>

                {/* Events list inside date cell */}
                <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-none">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-1 rounded bg-violet-500/20 border border-violet-500/30 text-[10px] font-medium text-violet-200 truncate flex items-center gap-1"
                      title={`${m.title} at ${m.time}`}
                    >
                      <Video className="w-2.5 h-2.5 text-violet-400 shrink-0" />
                      <span className="truncate">{m.title}</span>
                    </div>
                  ))}

                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-1 rounded bg-rose-500/20 border border-rose-500/30 text-[10px] font-medium text-rose-200 truncate flex items-center gap-1"
                      title={`Deadline: ${t.key} - ${t.title}`}
                    >
                      <Clock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                      <span className="truncate font-mono font-bold">{t.key}:</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
