import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Pin,
  Star,
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Check,
  CheckCheck,
  FolderKanban,
  Volume2,
  Bookmark,
  Sparkles,
  Filter,
  Trash2,
  X,
  ChevronDown,
  User,
  Shield,
  Maximize2,
} from 'lucide-react';
import { Project, TeamMember } from '../../types';

interface InboxViewProps {
  currentProject?: Project | null;
  projects?: Project[];
  onSelectProject?: (p: Project) => void;
  userName?: string;
  userAvatar?: string;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  isMe: boolean;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isPinned?: boolean;
  isKept?: boolean;
  isAudio?: boolean;
  audioDuration?: string;
}

interface ChatThread {
  id: string;
  projectId: string;
  title: string;
  avatar: string;
  isGroup: boolean;
  roleOrType: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  messages: Message[];
}

export const InboxView: React.FC<InboxViewProps> = ({
  currentProject,
  projects = [],
  onSelectProject,
  userName = 'Yedla Sai Bhavani',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
}) => {
  const selectedProj = currentProject || projects[0] || { id: 'proj-1', name: 'Apollo-Core Engine' };

  // Sample threads scoped to projects
  const [allThreads, setAllThreads] = useState<Record<string, ChatThread[]>>({
    'proj-1': [
      {
        id: 't-1',
        projectId: 'proj-1',
        title: 'Enterprise SaaS Team',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150',
        isGroup: true,
        roleOrType: 'Channel • releases sync',
        lastMessage: 'Deployed the latest PgBouncer patch to staging.',
        lastMessageTime: '11:20 AM',
        unreadCount: 2,
        messages: [
          {
            id: 'm-1',
            sender: 'Sarah Chen',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            isMe: false,
            text: 'Hey team! We need to verify database connection pool limits before rollout.',
            timestamp: '10:45 AM',
            status: 'read',
            isKept: true,
          },
          {
            id: 'm-2',
            sender: userName,
            senderAvatar: userAvatar,
            isMe: true,
            text: 'I pushed the updated pool size config to 120 max connections.',
            timestamp: '11:02 AM',
            status: 'read',
          },
          {
            id: 'm-3',
            sender: 'David Kim',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
            isMe: false,
            text: 'Deployed the latest PgBouncer patch to staging.',
            timestamp: '11:20 AM',
            status: 'read',
            isPinned: true,
            isKept: true,
          },
        ],
      },
      {
        id: 't-2',
        projectId: 'proj-1',
        title: 'Sai Bhavani',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        isGroup: false,
        roleOrType: 'Direct • Lead Backend Developer',
        lastMessage: 'Voice Note (0:42) - Architecture update',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        isOnline: true,
        messages: [
          {
            id: 'm-201',
            sender: 'Sai Bhavani',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            isMe: false,
            text: 'Hey! Here is the voice memo regarding database sharding routing:',
            timestamp: 'Yesterday 4:15 PM',
            status: 'read',
            isAudio: true,
            audioDuration: '0:42',
            isKept: true,
          },
          {
            id: 'm-202',
            sender: userName,
            senderAvatar: userAvatar,
            isMe: true,
            text: 'Thanks! Checked the shard mapping, looks solid.',
            timestamp: 'Yesterday 4:20 PM',
            status: 'read',
          },
        ],
      },
    ],
    'proj-2': [
      {
        id: 't-3',
        projectId: 'proj-2',
        title: 'Cloud SQL Migration Sync',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        isGroup: true,
        roleOrType: 'Channel • database migration',
        lastMessage: 'PostgreSQL dump completed without lock errors.',
        lastMessageTime: '09:15 AM',
        unreadCount: 1,
        messages: [
          {
            id: 'm-301',
            sender: 'Alex Rivera',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            isMe: false,
            text: 'PostgreSQL dump completed without lock errors.',
            timestamp: '09:15 AM',
            status: 'read',
            isPinned: true,
          },
        ],
      },
    ],
  });

  const currentProjectThreads = useMemo(() => {
    return allThreads[selectedProj.id] || [
      {
        id: `t-generic-${selectedProj.id}`,
        projectId: selectedProj.id,
        title: `${selectedProj.name} General`,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150',
        isGroup: true,
        roleOrType: `Channel • ${selectedProj.key} Team`,
        lastMessage: 'Welcome to the project chat channel!',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m-init-${selectedProj.id}`,
            sender: 'System Bot',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
            isMe: false,
            text: `Channel created for ${selectedProj.name}. Start collaborating with your team members!`,
            timestamp: 'Just now',
            status: 'read',
            isPinned: true,
          },
        ],
      },
    ];
  }, [allThreads, selectedProj]);

  const [activeThreadId, setActiveThreadId] = useState<string>(
    currentProjectThreads[0]?.id || 't-1'
  );

  const activeThread = useMemo(() => {
    return currentProjectThreads.find((t) => t.id === activeThreadId) || currentProjectThreads[0];
  }, [currentProjectThreads, activeThreadId]);

  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'pinned' | 'kept'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Active Call States
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Call duration counter
  useEffect(() => {
    let timer: any = null;
    if (activeCallType && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCallType, callStatus]);

  // Connect video stream ref when mediaStream changes
  useEffect(() => {
    if (videoRef.current && mediaStream && activeCallType === 'video') {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, activeCallType]);

  const handleStartCall = async (type: 'audio' | 'video') => {
    setActiveCallType(type);
    setCallStatus('connecting');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoDisabled(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      setMediaStream(stream);
      setCallStatus('connected');
    } catch (err) {
      console.warn('Camera/Microphone access notice:', err);
      // Connected call state fallback if restricted in preview
      setCallStatus('connected');
    }
  };

  const handleEndCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    setActiveCallType(null);
    setCallStatus('ended');
  };

  const toggleMute = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: userName,
      senderAvatar: userAvatar,
      isMe: true,
      text: inputMessage.trim(),
      timestamp: 'Just now',
      status: 'sent',
    };

    setAllThreads((prev) => {
      const projThreads = prev[selectedProj.id] || currentProjectThreads;
      const updated = projThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastMessage: newMsg.text,
            lastMessageTime: 'Just now',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      });
      return { ...prev, [selectedProj.id]: updated };
    });

    setInputMessage('');
  };

  // Toggle Keep Message / Bookmark
  const toggleKeepMessage = (msgId: string) => {
    if (!activeThread) return;
    setAllThreads((prev) => {
      const projThreads = prev[selectedProj.id] || currentProjectThreads;
      const updated = projThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === msgId ? { ...m, isKept: !m.isKept } : m
            ),
          };
        }
        return t;
      });
      return { ...prev, [selectedProj.id]: updated };
    });
  };

  // Toggle Pin Message
  const togglePinMessage = (msgId: string) => {
    if (!activeThread) return;
    setAllThreads((prev) => {
      const projThreads = prev[selectedProj.id] || currentProjectThreads;
      const updated = projThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
            ),
          };
        }
        return t;
      });
      return { ...prev, [selectedProj.id]: updated };
    });
  };

  // Filter threads
  const filteredThreads = currentProjectThreads.filter((t) => {
    if (searchQuery.trim()) {
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterMode === 'unread') return t.unreadCount > 0;
    if (filterMode === 'pinned') return t.messages.some((m) => m.isPinned);
    if (filterMode === 'kept') return t.messages.some((m) => m.isKept);
    return true;
  });

  const keptMessagesInActiveChat = activeThread?.messages.filter((m) => m.isKept) || [];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-[#090b10] text-slate-100 overflow-hidden select-none">
      {/* Top Scope Header Bar */}
      <div className="px-4 py-2.5 bg-[#0d0f17] border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              WhatsApp Workspace Chat
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Project-Scoped
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Only displaying communications for <strong className="text-indigo-300">{selectedProj.name}</strong>
            </p>
          </div>
        </div>

        {/* Project Selector Switcher */}
        {projects.length > 0 && onSelectProject && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Switch Project:</span>
            <select
              value={selectedProj.id}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) onSelectProject(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main WhatsApp Grid Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Threads Column */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-[#0d0f17] border-r border-slate-800/80 flex flex-col shrink-0 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Filters */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search or start new chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Sub-filters: All, Unread, Pinned, Kept */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === 'unread'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterMode('kept')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterMode === 'kept'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Bookmark className="w-3 h-3 text-amber-300" />
                <span>Keep Msgs</span>
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs italic">
                No conversations found for {selectedProj.name}.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = activeThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setShowMobileChat(true);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                      isActive
                        ? 'bg-emerald-950/30 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={thread.avatar}
                        alt={thread.title}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      {thread.isOnline && (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0d0f17] absolute bottom-0 right-0" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">
                          {thread.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate leading-tight">
                        {thread.lastMessage}
                      </p>
                      <span className="text-[10px] text-indigo-400 font-medium block">
                        {thread.roleOrType}
                      </span>
                    </div>

                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        {activeThread ? (
          <div
            className={`flex-1 flex flex-col bg-[#090b10] shrink-0 ${
              !showMobileChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Active Chat Header */}
            <div className="p-3 bg-[#0d0f17] border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>

                <img
                  src={activeThread.avatar}
                  alt={activeThread.title}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-white truncate flex items-center gap-2">
                    <span>{activeThread.title}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                      {selectedProj.key}
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {activeThread.roleOrType}
                  </span>
                </div>
              </div>

              {/* Chat Action Icons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handleStartCall('audio')}
                  className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-600/30 border border-emerald-500/30 transition flex items-center gap-1.5"
                  title="Start Voice Audio Call"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold hidden lg:inline">Audio Call</span>
                </button>
                <button
                  onClick={() => handleStartCall('video')}
                  className="p-2 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600/30 border border-indigo-500/30 transition flex items-center gap-1.5"
                  title="Start Live HD Video Call"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-xs font-bold hidden lg:inline">Video Call</span>
                </button>
                <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kept / Pinned Messages Bar */}
            {keptMessagesInActiveChat.length > 0 && (
              <div className="bg-amber-950/20 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2 truncate">
                  <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">Kept Messages ({keptMessagesInActiveChat.length}):</span>
                  <span className="text-slate-300 truncate italic">
                    "{keptMessagesInActiveChat[keptMessagesInActiveChat.length - 1].text}"
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">Pinned</span>
              </div>
            )}

            {/* Chat Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-radial from-slate-950 to-[#090b10]">
              <div className="text-center my-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  Today • {selectedProj.name} Chat
                </span>
              </div>

              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 group ${
                    msg.isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!msg.isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.sender}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1 relative shadow-md ${
                      msg.isMe
                        ? 'bg-emerald-600/90 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {!msg.isMe && (
                      <span className="font-bold text-emerald-400 text-[11px] block">
                        {msg.sender}
                      </span>
                    )}

                    {/* Audio Voice Note rendering */}
                    {msg.isAudio ? (
                      <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 my-1">
                        <button className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-emerald-400" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{msg.audioDuration}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed text-xs">{msg.text}</p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1 text-[9px] text-slate-400 font-mono">
                      {msg.isKept && (
                        <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" title="Kept Message" />
                      )}
                      {msg.isPinned && (
                        <Pin className="w-3 h-3 text-blue-400 fill-blue-400" title="Pinned" />
                      )}
                      <span>{msg.timestamp}</span>
                      {msg.isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>

                    {/* Hover actions menu to Keep or Pin message */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded-lg border border-slate-800">
                      <button
                        onClick={() => toggleKeepMessage(msg.id)}
                        className={`p-1 text-[10px] ${
                          msg.isKept ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Keep Message (WhatsApp style)"
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => togglePinMessage(msg.id)}
                        className={`p-1 text-[10px] ${
                          msg.isPinned ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Pin Message"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Toolbar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-[#0d0f17] border-t border-slate-800/80 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={`Message ${activeThread.title} (${selectedProj.name})...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
            Select a conversation to start chatting
          </div>
        )}
      </div>
      {/* Active Audio & Video Call Overlay Modal */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-[#0c0e16] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col space-y-4 p-6 relative">
            {/* Call Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-sm text-white">
                  {activeCallType === 'video' ? 'HD Video Call' : 'Encrypted Audio Call'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-400">
                  {callStatus === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
                </span>
                <span className="text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>WebRTC</span>
                </span>
              </div>
            </div>

            {/* Video or Audio Screen Stream */}
            <div className="relative w-full h-72 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              {activeCallType === 'video' && !isVideoDisabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 p-6">
                  <div className="relative">
                    <img
                      src={activeThread.avatar}
                      alt={activeThread.title}
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/40 shadow-2xl"
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0c0e16] flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-extrabold text-base text-white">{activeThread.title}</h4>
                    <p className="text-xs text-slate-400">{activeThread.roleOrType}</p>
                  </div>

                  {/* Audio Wave Visualizer */}
                  <div className="flex items-center gap-1.5 h-8 pt-2">
                    <div className="w-1.5 bg-indigo-500 rounded-full h-4 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 bg-indigo-400 rounded-full h-8 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 bg-indigo-500 rounded-full h-6 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <div className="w-1.5 bg-emerald-400 rounded-full h-7 animate-bounce" style={{ animationDelay: '450ms' }} />
                    <div className="w-1.5 bg-indigo-400 rounded-full h-5 animate-bounce" style={{ animationDelay: '600ms' }} />
                  </div>
                </div>
              )}

              {/* In-Call Info Label Overlay */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">{activeThread.title}</span>
              </div>
            </div>

            {/* In-Call Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-2xl border transition ${
                  isMuted
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {activeCallType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-3.5 rounded-2xl border transition ${
                    isVideoDisabled
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                  }`}
                  title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Hang Up Button */}
              <button
                onClick={handleEndCall}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
