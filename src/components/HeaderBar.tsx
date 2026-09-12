import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Mail,
  Zap,
  LogOut,
  Menu,
  Search,
} from 'lucide-react';
import { Project } from '../types';
import { getSentEmailNotifications } from '../lib/deadlineNotifier';

interface HeaderBarProps {
  currentTabTitle: string;
  currentProject?: Project | null;
  unreadCount?: number;
  userAvatar?: string;
  userName?: string;
  userRole?: string;
  onlineUsers?: { userId: string; userName: string; userAvatar: string }[];
  onOpenNewTask: () => void;
  onOpenInbox: () => void;
  onOpenProfile?: () => void;
  onOpenEmailModal?: () => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenSearch?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTabTitle,
  currentProject,
  unreadCount = 3,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  userName = 'Yedla Sai Bhavani',
  userRole = 'Lead Architect',
  onlineUsers = [],
  onOpenNewTask,
  onOpenInbox,
  onOpenProfile,
  onOpenEmailModal,
  onLogout,
  onToggleMobileMenu,
  onOpenSearch,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [emailAlertCount, setEmailAlertCount] = useState<number>(0);

  const projectName = currentProject?.name || 'Enterprise SaaS';

  useEffect(() => {
    const updateCount = () => {
      const logs = getSentEmailNotifications();
      setEmailAlertCount(logs.length);
    };
    updateCount();

    const handleEmailEvent = () => updateCount();
    window.addEventListener('email_notification_sent', handleEmailEvent);
    return () => window.removeEventListener('email_notification_sent', handleEmailEvent);
  }, []);

  // Project-scoped notifications
  const [projectNotifs] = useState([
    {
      id: 'pn-1',
      title: `Task Deadline approaching in ${projectName}`,
      body: 'Migrate User Auth DB is due in <24 hours. Automated Email Dispatched.',
      time: '10m ago',
      read: false,
    },
    {
      id: 'pn-2',
      title: `Sarah Chen tagged you in ${projectName}`,
      body: 'Please review PgBouncer pooler configuration.',
      time: '1h ago',
      read: false,
    },
  ]);

  // Project-scoped team messages
  const [projectMessages, setProjectMessages] = useState([
    {
      id: 'pm-1',
      sender: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      text: `Hey team! Deploying sprint changes for ${projectName}. Let me know if you see any CORS issues.`,
      time: '11:15 AM',
    },
  ]);

  const [newMessageText, setNewMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setProjectMessages((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        sender: userName,
        avatar: userAvatar,
        text: newMessageText.trim(),
        time: 'Just now',
      },
    ]);
    setNewMessageText('');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-[#0d0f17] border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between shrink-0 select-none z-30 text-slate-100 relative">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {currentTabTitle}
        </h1>
        {currentProject && (
          <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 hidden lg:inline-block truncate max-w-[200px]">
            Project: {currentProject.name}
          </span>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Real-time Presence Avatars */}
        {onlineUsers && onlineUsers.length > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 mr-1">Live:</span>
            <div className="flex -space-x-1.5 items-center">
              {onlineUsers.slice(0, 4).map((u) => (
                <div
                  key={u.userId}
                  title={`${u.userName} (Active now)`}
                  className="relative w-5 h-5 rounded-full overflow-hidden border border-emerald-500/50 bg-slate-800 shadow-xs"
                >
                  {u.userAvatar ? (
                    <img src={u.userAvatar} alt={u.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center">
                      {u.userName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {onlineUsers.length > 4 && (
                <span className="text-[9px] font-mono text-slate-400 pl-1">
                  +{onlineUsers.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Global Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
            title="Search tasks, projects, docs (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-950 text-slate-500 rounded border border-slate-800">
              Ctrl+K
            </kbd>
          </button>
        )}

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsMsgOpen(false);
            }}
            className={`relative p-2 rounded-xl border transition ${
              isNotifOpen
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={`Notifications for ${projectName}`}
          >
            <Bell className="w-4 h-4" />
            {projectNotifs.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#0d0f17]">
                {projectNotifs.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-xs text-white">
                    Notifications ({projectName})
                  </h3>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {projectNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      !n.read
                        ? 'bg-indigo-950/30 border-indigo-500/30 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-300">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>

              {/* Full Tab Button */}
              <button
                onClick={() => {
                  setIsNotifOpen(false);
                  onOpenInbox();
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition border border-slate-700/60"
              >
                <span>Open WhatsApp Workspace Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Message Icon for Project Chat */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMsgOpen(!isMsgOpen);
              setIsNotifOpen(false);
            }}
            className={`p-2 rounded-xl border transition ${
              isMsgOpen
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={`Team Chat for ${projectName}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Project Messages Popover */}
          {isMsgOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-xs text-white">
                    Project Messages ({projectName})
                  </h3>
                </div>
                <button
                  onClick={() => setIsMsgOpen(false)}
                  className="p-1 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat history */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {projectMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          {msg.sender}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder={`Message ${projectName} team...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <button
                onClick={() => {
                  setIsMsgOpen(false);
                  onOpenInbox();
                }}
                className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition"
              >
                <span>Open WhatsApp Workspace Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* User Badge Avatar */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-xl cursor-pointer hover:border-slate-700 transition"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-indigo-500/40" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              {getInitials(userName)}
            </div>
          )}
          <div className="hidden md:flex flex-col text-left">
            <span className="font-bold text-xs text-white leading-tight truncate max-w-[120px]">{userName}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{userRole}</span>
          </div>
        </div>

        {/* Quick Header Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 text-xs font-bold"
            title="Log out of current workspace session"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
