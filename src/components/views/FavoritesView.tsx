import React, { useState } from 'react';
import {
  Star,
  Search,
  Plus,
  MessageSquare,
  LayoutGrid,
  AlertTriangle,
  FileText,
  Pin,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Project, Task } from '../../types';

interface FavoritesViewProps {
  projects?: Project[];
  tasks?: Task[];
  onNavigateTab?: (tab: any) => void;
  onSelectProject?: (p: Project) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  projects = [],
  tasks = [],
  onNavigateTab,
  onSelectProject,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'bookmarks' | 'chats' | 'tasks' | 'files'
  >('bookmarks');

  const [searchQuery, setSearchQuery] = useState('');

  // Favorites data matching screenshot 2
  const [bookmarks, setBookmarks] = useState([
    {
      id: 'b-1',
      title: 'Enterprise SaaS Team',
      type: 'Channel • releases sync',
      icon: MessageSquare,
      category: 'chats',
      buttonText: 'OPEN CHAT',
      action: 'chat',
    },
    {
      id: 'b-2',
      title: 'Sai Bhavani',
      type: 'Direct • Lead Backend Developer',
      icon: MessageSquare,
      category: 'chats',
      buttonText: 'OPEN HUDDLE',
      action: 'huddle',
    },
    {
      id: 'b-3',
      title: 'Apollo-Core Kanban Board',
      type: 'Board • sprint tracking',
      icon: LayoutGrid,
      category: 'tasks',
      buttonText: 'OPEN BOARD',
      action: 'board',
    },
    {
      id: 'b-4',
      title: 'Resolve staging cluster deployment bottlenecks',
      type: 'Issue • CRITICAL',
      icon: AlertTriangle,
      category: 'tasks',
      buttonText: 'OPEN TICKET',
      action: 'ticket',
    },
    {
      id: 'b-5',
      title: 'Sharding_Dashboard_v2.fig',
      type: 'Figma design mockup • 14.2 MB',
      icon: FileText,
      category: 'files',
      buttonText: 'DOWNLOAD',
      action: 'download',
    },
    {
      id: 'b-6',
      title: 'State_Architecture.pdf',
      type: 'Architecture Specification • 4.2 MB',
      icon: FileText,
      category: 'files',
      buttonText: 'DOWNLOAD',
      action: 'download',
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('');

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBookmarks((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        title: newTitle.trim(),
        type: newType.trim() || 'Custom Bookmark',
        icon: FileText,
        category: 'files',
        buttonText: 'OPEN ITEM',
        action: 'open',
      },
    ]);
    setNewTitle('');
    setNewType('');
    setIsAddModalOpen(false);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleCardButtonClick = (action: string) => {
    if (action === 'chat' || action === 'huddle') {
      if (onNavigateTab) onNavigateTab('inbox');
    } else if (action === 'board' || action === 'ticket') {
      if (onNavigateTab) onNavigateTab('projects');
    } else {
      alert('Downloading bookmarked asset...');
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    if (searchQuery.trim()) {
      return (
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeSubTab === 'chats') return b.category === 'chats';
    if (activeSubTab === 'tasks') return b.category === 'tasks';
    if (activeSubTab === 'files') return b.category === 'files';
    return true;
  });

  const chatCount = bookmarks.filter((b) => b.category === 'chats').length;
  const taskCount = bookmarks.filter((b) => b.category === 'tasks').length;
  const fileCount = bookmarks.filter((b) => b.category === 'files').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6 select-none">
      {/* Header Title & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Favorites</span>
          </h1>
        </div>

        {/* Subtabs: All Bookmarks | Chats & Members | Tasks & Boards | Files & Links */}
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'bookmarks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bookmarks
          </button>
          <button
            onClick={() => setActiveSubTab('chats')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'chats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chats & Members
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'tasks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tasks & Boards
          </button>
          <button
            onClick={() => setActiveSubTab('files')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'files'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Files & Links
          </button>
        </div>
      </div>

      {/* Main Grid: Left Bookmarks + Right Breakdown Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Search Bar + Bookmarks Grid (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar + Add Bookmark Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search bookmarked items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bookmark</span>
            </button>
          </div>

          {/* Cards Grid (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBookmarks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition space-y-4 shadow-xl relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>

                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="p-1 text-amber-400 hover:scale-110 transition shrink-0"
                        title="Starred Favorite"
                      >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{item.type}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCardButtonClick(item.action)}
                    className="w-fit px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-[11px] font-extrabold text-slate-200 tracking-wider uppercase transition border border-slate-700/60"
                  >
                    {item.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Breakdown & Drag & Drop Pin Widgets */}
        <div className="space-y-6">
          {/* Breakdown Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Breakdown</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                  Chats
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  0{chatCount}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                  Tasks
                </span>
                <span className="text-xl font-black text-blue-400 mt-1 block">
                  0{taskCount}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                  Files
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  0{fileCount}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                  Total
                </span>
                <span className="text-xl font-black text-indigo-400 mt-1 block">
                  0{bookmarks.length}
                </span>
              </div>
            </div>
          </div>

          {/* Drag & Drop Pin Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Pin className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Drag & Drop Pin</h3>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-950/40 text-center space-y-2 transition cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Pin className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="font-bold text-xs text-white">Drop components here to Bookmark</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Accepts document files, widgets, or shared task cards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Add New Bookmark</h3>
            <form onSubmit={handleAddBookmark} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Bookmark Title</label>
                <input
                  type="text"
                  placeholder="e.g. Production Deployment Runbook"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Type / Description</label>
                <input
                  type="text"
                  placeholder="e.g. PDF Specification • 2.8 MB"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md"
                >
                  Add Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
