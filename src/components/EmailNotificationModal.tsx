import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  User,
  Shield,
  Bell,
  Trash2,
  Zap,
} from 'lucide-react';
import { EmailNotification, getSentEmailNotifications, saveEmailNotifications } from '../lib/deadlineNotifier';
import { Task, TeamMember, Project } from '../types';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  members: TeamMember[];
  projects: Project[];
  onTriggerManualAlert: (task: Task) => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  tasks,
  members,
  projects,
  onTriggerManualAlert,
}) => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
  const [selectedTaskForTest, setSelectedTaskForTest] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [autoServiceEnabled, setAutoServiceEnabled] = useState<boolean>(true);

  // Load email notifications when open
  useEffect(() => {
    if (isOpen) {
      const logs = getSentEmailNotifications();
      setNotifications(logs);
      if (logs.length > 0 && !selectedNotification) {
        setSelectedNotification(logs[0]);
      }
    }
  }, [isOpen]);

  // Listen for real-time dispatch events
  useEffect(() => {
    const handleEmailSent = (e: any) => {
      const updated = e.detail || getSentEmailNotifications();
      setNotifications(updated);
    };
    window.addEventListener('email_notification_sent', handleEmailSent);
    return () => window.removeEventListener('email_notification_sent', handleEmailSent);
  }, []);

  if (!isOpen) return null;

  const handleClearLogs = () => {
    if (confirm('Clear all sent email notification logs?')) {
      saveEmailNotifications([]);
      setNotifications([]);
      setSelectedNotification(null);
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveEmailNotifications(updated);
    setNotifications(updated);
  };

  const handleSendTestAlert = () => {
    if (!selectedTaskForTest) return;
    const task = tasks.find((t) => t.id === selectedTaskForTest);
    if (task) {
      onTriggerManualAlert(task);
      setSelectedTaskForTest('');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.hoursRemaining <= 24;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0e111a] border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] max-h-[750px] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Automated Task Deadline Email Dispatcher</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Background Service Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitors task due dates every 30s & automatically dispatches email alerts within 24h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              title="Clear Notification History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Test Sender & Controls */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Test Dispatch Bar */}
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-slate-300 shrink-0 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Test Email Dispatch:
            </span>
            <select
              value={selectedTaskForTest}
              onChange={(e) => setSelectedTaskForTest(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white flex-1 max-w-xs focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a task to trigger test email...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.key}] {t.title} (Due: {t.dueDate})
                </option>
              ))}
            </select>
            <button
              onClick={handleSendTestAlert}
              disabled={!selectedTaskForTest}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Alert</span>
            </button>
          </div>

          {/* Filter switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${filter === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1 rounded-lg font-bold transition ${filter === 'urgent' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
            >
              &lt;24h Deadlines
            </button>
          </div>
        </div>

        {/* Content Body: List on Left, Email Preview on Right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Email Log List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-700" />
                <p className="font-bold text-xs">No email notifications dispatched yet.</p>
                <p className="text-[11px] text-slate-600">
                  Select a task above to trigger a test email alert or set a task due date within 24 hours!
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedNotification(item);
                    handleMarkAsRead(item.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition space-y-1.5 relative ${
                    selectedNotification?.id === item.id
                      ? 'bg-violet-950/40 border-violet-500/60 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold text-violet-400">
                      [{item.taskKey}]
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white line-clamp-1">
                    {item.taskTitle}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="truncate max-w-[150px]">To: {item.recipientName}</span>
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                      {item.hoursRemaining < 0
                        ? 'OVERDUE'
                        : `${item.hoursRemaining}h left`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Email Body Viewer */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-slate-900/40">
            {selectedNotification ? (
              <div className="space-y-6">
                <div className="space-y-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Status: Dispatched & Delivered
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(selectedNotification.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {selectedNotification.subject}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Recipient:</span>
                      <strong className="text-violet-300">{selectedNotification.recipientName}</strong>
                      <span className="text-slate-400 block text-[11px]">{selectedNotification.recipientEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Project & Due Date:</span>
                      <strong className="text-white">{selectedNotification.projectName}</strong>
                      <span className="text-amber-400 block text-[11px] font-bold">
                        DueDate: {selectedNotification.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Email Body Preview Box */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-sans shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">From: dispatch-automation@acme.corp</span>
                    <span className="text-violet-400 font-bold">Acme Sprint Engine</span>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                    {selectedNotification.body}
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Acme Enterprise Task Automation Engine</span>
                    <span className="text-emerald-400 font-bold">✓ SSL Encrypted Dispatch</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <Mail className="w-10 h-10 text-slate-700" />
                <p className="text-sm font-bold">Select an email log to view complete payload</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
