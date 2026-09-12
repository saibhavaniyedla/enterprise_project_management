import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Video,
  Code2,
  BarChart3,
  Inbox,
  Star,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

export type MainTab =
  | 'dashboard'
  | 'projects'
  | 'team'
  | 'meetings'
  | 'devhub'
  | 'analytics'
  | 'inbox'
  | 'favorites'
  | 'settings'
  | 'profile';

interface SidebarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  unreadCount?: number;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  isWorkspaceUnlocked?: boolean;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 3,
  userName = 'Yedla Sai Bhavani',
  userRole = 'Team Member',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  isWorkspaceUnlocked = true,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onOpenSearch,
}) => {
  const mainNavItems: { id: MainTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'devhub', label: 'Dev Hub', icon: Code2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadCount },
  ];

  const secondaryNavItems: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleSelectTab = (tab: MainTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none">
      <div>
        {/* Acme Corp Enterprise Brand Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 text-base">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                Acme Corp
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 w-fit">
                ENTERPRISE
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Search bar */}
        <div className="p-3">
          <div
            onClick={onOpenSearch}
            className="relative cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500 group-hover:text-indigo-400 transition" />
            <input
              type="text"
              readOnly
              placeholder="Search (Ctrl+K)..."
              onClick={onOpenSearch}
              onFocus={onOpenSearch}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pb-3 space-y-5">
          {/* Main Navigation Group */}
          <div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLocked = item.id !== 'dashboard' && !isWorkspaceUnlocked;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isLocked) {
                        alert('Please select or create an active workspace first.');
                        handleSelectTab('dashboard');
                        return;
                      }
                      handleSelectTab(item.id);
                    }}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 group ${
                      isLocked
                        ? 'opacity-40 cursor-not-allowed text-slate-600 hover:bg-transparent'
                        : isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isLocked
                            ? 'text-slate-600'
                            : isActive
                            ? 'text-blue-400 scale-105'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isLocked ? (
                      <span className="text-[10px] text-slate-600 font-mono">🔒</span>
                    ) : item.badge && item.badge > 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-500 text-white shadow-xs">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400 opacity-80" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Preferences Group */}
          <div className="pt-2 border-t border-slate-800/60">
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive
                            ? 'text-blue-400 scale-105'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition group"
              >
                <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-105 transition" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/60 bg-[#0a0b10]">
        <div
          onClick={() => handleSelectTab('profile')}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
              YS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-xs truncate">{userName}</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">{userRole}</span>
            </div>
          </div>
          <User className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 transition" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0d0f17] border-r border-slate-800/80 text-slate-300 flex-col justify-between shrink-0 select-none min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-over Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[80vw] bg-[#0d0f17] border-r border-slate-800 text-slate-300 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
