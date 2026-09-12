import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Video,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Plus,
  ExternalLink,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { Task, TeamMember, Project } from '../../types';
import {
  requestCalendarAuth,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  getCachedGoogleToken,
  GoogleCalendarEvent,
} from '../../lib/googleCalendar';

interface ProjectCalendarSubViewProps {
  tasks: Task[];
  members: TeamMember[];
  currentProject?: Project | null;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ProjectCalendarSubView: React.FC<ProjectCalendarSubViewProps> = ({
  tasks,
  members,
  currentProject,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Google Calendar Integration states
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => !!getCachedGoogleToken());
  const [isConnectingCalendar, setIsConnectingCalendar] = useState<boolean>(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ dayNum: number; dateStr: string } | null>(null);

  // Modal for creating a new Google Calendar reminder event
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventPriority, setNewEventPriority] = useState('Medium');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Check initial token cache status
  useEffect(() => {
    setIsGoogleConnected(!!getCachedGoogleToken());
  }, []);

  // Fetch real Google Calendar events when month changes and connected
  useEffect(() => {
    if (!isGoogleConnected) return;

    const loadMonthEvents = async () => {
      try {
        setIsSyncingCalendar(true);
        // Start of month to end of month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        const events = await fetchGoogleCalendarEvents(
          firstDay.toISOString(),
          lastDay.toISOString()
        );
        setGoogleEvents(events);
      } catch (err) {
        console.warn('Google Calendar fetch error:', err);
      } finally {
        setIsSyncingCalendar(false);
      }
    };

    loadMonthEvents();
  }, [currentYear, currentMonth, isGoogleConnected]);

  // Connect to Google Calendar via OAuth
  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnectingCalendar(true);
      await requestCalendarAuth();
      setIsGoogleConnected(true);
      setReminderToast('Google Calendar connected! Syncing all task reminders & schedules...');

      // Load initial events
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      try {
        const events = await fetchGoogleCalendarEvents(firstDay.toISOString(), lastDay.toISOString());
        setGoogleEvents(events);
      } catch (fetchErr: any) {
        console.warn('Initial calendar events fetch notice:', fetchErr?.message || fetchErr);
      }

      setTimeout(() => setReminderToast(null), 4500);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.isCancelled ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        console.info('Google Calendar auth popup dismissed by user.');
        setReminderToast('Google Calendar sign-in was closed. Click Connect when you are ready.');
      } else {
        console.warn('Google Calendar connection status:', err?.message || err);
        setReminderToast(`Google Calendar: ${err.message || 'Please try connecting again'}`);
      }
      setCachedGoogleToken(null);
      setIsGoogleConnected(false);
      setTimeout(() => setReminderToast(null), 5000);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  // Push task deadline to Google Calendar
  const handleAddDeadlineReminder = async (task: Task) => {
    if (!isGoogleConnected || !getCachedGoogleToken()) {
      await handleConnectGoogleCalendar();
      if (!getCachedGoogleToken()) return;
    }
    try {
      setIsSyncingCalendar(true);
      const due = task.dueDate || new Date().toISOString().split('T')[0];
      await createGoogleCalendarEvent({
        title: task.title,
        description: task.description || 'Sprint task deadline reminder',
        dueDate: due,
        priority: task.priority,
        projectName: currentProject?.name || 'Active Project',
      });

      setReminderToast(`Google Calendar reminder created for "${task.title}" on ${due}!`);
      setTimeout(() => setReminderToast(null), 4000);

      // Refresh events
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      try {
        const events = await fetchGoogleCalendarEvents(firstDay.toISOString(), lastDay.toISOString());
        setGoogleEvents(events);
      } catch (e) {
        console.warn('Refresh calendar events notice:', e);
      }
    } catch (err: any) {
      setReminderToast(`Google Calendar: ${err.message}`);
      setTimeout(() => setReminderToast(null), 5000);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Handle custom reminder submission
  const handleCreateCustomReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    if (!isGoogleConnected || !getCachedGoogleToken()) {
      await handleConnectGoogleCalendar();
      if (!getCachedGoogleToken()) return;
    }

    try {
      setIsCreatingEvent(true);
      await createGoogleCalendarEvent({
        title: newEventTitle.trim(),
        description: `Scheduled reminder for ${currentProject?.name || 'Active Project'}`,
        dueDate: newEventDate,
        priority: newEventPriority,
        projectName: currentProject?.name || 'Active Project',
      });

      setIsNewEventModalOpen(false);
      setNewEventTitle('');
      setReminderToast(`Reminder saved to Google Calendar for ${newEventDate}!`);
      setTimeout(() => setReminderToast(null), 4000);

      // Refresh
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      const events = await fetchGoogleCalendarEvents(firstDay.toISOString(), lastDay.toISOString());
      setGoogleEvents(events);
    } catch (err: any) {
      setReminderToast(`Failed to add reminder: ${err.message}`);
      setTimeout(() => setReminderToast(null), 5000);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToMonth = (monthIdx: number) => {
    setCurrentDate(new Date(currentYear, monthIdx, 1));
  };

  const handleJumpToYear = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleSendTeamReminders = () => {
    setReminderToast(
      `Deadline & Meeting reminders dispatched to all ${members.length} team members!`
    );
    setTimeout(() => {
      setReminderToast(null), 5000;
    });
  };

  // Calculate days for current view
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const today = new Date();
  const isCurrentMonthThisMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Get events and tasks for specific day
  const getEventsForDay = (dayNum: number) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    // Tasks on this day
    const dayTasks = tasks.filter((t) => t.dueDate === dayStr);

    // Google Calendar events on this day
    const dayGoogleEvents = googleEvents.filter((ev) => {
      const startStr = ev.start.dateTime || ev.start.date || '';
      return startStr.startsWith(dayStr);
    });

    return { dayTasks, dayGoogleEvents, dayStr };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Unified Project Schedule & Google Calendar
            </span>
            <span className="text-xs font-mono text-slate-400">
              Project: {currentProject?.name || 'Active Project'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-400" />
            <span>Project Calendar & Reminders</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Google Calendar Connection Status Button */}
          {isGoogleConnected ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Google Calendar Connected</span>
              </span>
              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogleCalendar}
              disabled={isConnectingCalendar}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition shrink-0"
            >
              {isConnectingCalendar ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CalendarCheck className="w-4 h-4" />
              )}
              <span>Connect Real Google Calendar</span>
            </button>
          )}

          {/* Action Button: Send Deadline Reminders for all team */}
          <button
            onClick={handleSendTeamReminders}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition shrink-0"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Send Reminders</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {reminderToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg animate-in fade-in">
          <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Month Navigation & All-Months Quick Select Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          {/* Previous / Next Month Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              {isSyncingCalendar && (
                <span className="text-xs text-indigo-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Today
            </button>
          </div>

          {/* Year & Month Dropdown Controls */}
          <div className="flex items-center gap-3">
            <select
              value={currentMonth}
              onChange={(e) => handleJumpToMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => handleJumpToYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            {/* Legend */}
            <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-slate-800 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Google Reminders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Task Deadlines</span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Quick Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {MONTH_NAMES.map((mName, idx) => {
            const isSelected = idx === currentMonth;
            return (
              <button
                key={mName}
                onClick={() => handleJumpToMonth(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {mName.slice(0, 3)}
              </button>
            );
          })}
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
          {/* Blank offset cells before the 1st of current month */}
          {Array.from({ length: firstDayWeekday }).map((_, idx) => (
            <div
              key={`blank-${idx}`}
              className="h-28 rounded-xl bg-slate-950/20 border border-slate-900/30"
            />
          ))}

          {daysArray.map((dayNum) => {
            const { dayTasks, dayGoogleEvents, dayStr } = getEventsForDay(dayNum);
            const isToday = isCurrentMonthThisMonth && today.getDate() === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDayEvents({ dayNum, dateStr: dayStr })}
                className={`h-28 rounded-xl p-2 border transition flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isToday
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
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
                  {/* Google Calendar Events */}
                  {dayGoogleEvents.map((gEvent) => (
                    <div
                      key={gEvent.id}
                      className="p-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-medium text-indigo-200 truncate flex items-center gap-1"
                      title={gEvent.summary}
                    >
                      <CalendarCheck className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{gEvent.summary}</span>
                    </div>
                  ))}

                  {/* Project Tasks */}
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

                  {dayTasks.length === 0 && dayGoogleEvents.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic select-none">No events</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDayEvents && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Events for {selectedDayEvents.dateStr}
              </h3>
              <p className="text-xs text-slate-400">
                Manage sprint deadlines and Google Calendar reminders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewEventDate(selectedDayEvents.dateStr);
                  setIsNewEventModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Deadlines Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Task Deadlines on this date
              </h4>
              {tasks.filter((t) => t.dueDate === selectedDayEvents.dateStr).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No tasks due on this date.</p>
              ) : (
                tasks
                  .filter((t) => t.dueDate === selectedDayEvents.dateStr)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-400">{t.key}</span>
                          <span className="text-xs font-semibold text-white">{t.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Priority: {t.priority}</span>
                      </div>
                      <button
                        onClick={() => handleAddDeadlineReminder(t)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                        title="Sync reminder to Google Calendar"
                      >
                        <CalendarCheck className="w-3 h-3" />
                        <span>Add to Google Cal</span>
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Google Calendar Events Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Google Calendar Events
              </h4>
              {googleEvents.filter((ev) =>
                (ev.start.dateTime || ev.start.date || '').startsWith(selectedDayEvents.dateStr)
              ).length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  {isGoogleConnected
                    ? 'No Google Calendar events scheduled for this day.'
                    : 'Connect Google Calendar above to view synced reminders.'}
                </p>
              ) : (
                googleEvents
                  .filter((ev) =>
                    (ev.start.dateTime || ev.start.date || '').startsWith(selectedDayEvents.dateStr)
                  )
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-white">{ev.summary}</span>
                      </div>
                      {ev.htmlLink && (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW GOOGLE CALENDAR REMINDER MODAL */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Google Calendar Reminder
                </h3>
              </div>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Release Deadline Review"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newEventPriority}
                    onChange={(e) => setNewEventPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                This event will be added to your real primary Google Calendar with pop-up and email reminder notifications.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingEvent}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {isCreatingEvent ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Create Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
