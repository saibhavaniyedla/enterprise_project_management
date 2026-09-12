import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Edit3,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  CreditCard,
  Building2,
  Lock,
  GitBranch,
  Bell,
  Globe,
  Save,
  Check,
  Copy,
  RefreshCw,
  Sliders,
  DollarSign,
  Download,
} from 'lucide-react';
import { Project } from '../../types';

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface SettingsViewProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  currentProject?: Project | null;
  onNavigateTab?: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userName = 'Yedla Sai Bhavani',
  userRole = 'Principal Software Engineer • Cloud Architecture',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  currentProject,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'security' | 'billing' | 'workspace'>('account');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Account Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopPush, setDesktopPush] = useState(true);
  const [timezone, setTimezone] = useState('America/Los_Angeles (PST)');
  const [themeMode, setThemeMode] = useState('Dark Twilight');

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('fusionsprint_live_pk_9841029381092830');
  const [copiedKey, setCopiedKey] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Billing State
  const [planTier, setPlanTier] = useState<'pro' | 'enterprise'>('enterprise');
  const [cardHolder, setCardHolder] = useState('Yedla Sai Bhavani');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  // Workspace Settings
  const [workspaceName, setWorkspaceName] = useState('Acme Corp Enterprise');
  const [workspaceDomain, setWorkspaceDomain] = useState('acme.corp');
  const [autoArchiveDays, setAutoArchiveDays] = useState('14');

  const triggerSaveNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = `fusionsprint_live_pk_${Math.random().toString(36).substring(2, 18)}`;
    setApiKey(newKey);
    triggerSaveNotification('New API Key Generated!');
  };

  const projName = currentProject?.name || 'Apollo-Core Engine';

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6">
      {/* Toast Banner */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Settings & Workspace Preferences</span>
          </h1>
        </div>

        {/* Subtabs: Account | Security | Billing | Workspace */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('account')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'account'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'billing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setActiveSubTab('workspace')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'workspace'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Workspace
          </button>
        </div>
      </div>

      {activeSubTab === 'account' && (
        <div className="space-y-6">
          {/* Top Grid: User Profile Card + Security Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Info (Col Span 2) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-white">{userName}</h2>
                    <p className="text-xs text-slate-300 font-medium">{userRole}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        Lead Architect
                      </span>
                      <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        Maintainer
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => triggerSaveNotification('Public link copied to clipboard')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-500/20 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Public Profile</span>
                </button>
              </div>

              {/* Notification Preferences */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Notification Preferences</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Automated Task Emails</h4>
                      <p className="text-[10px] text-slate-400">Receive 24h deadline alerts for team</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => {
                        setEmailAlerts(e.target.checked);
                        triggerSaveNotification(`Email Alerts ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Browser Push Notifications</h4>
                      <p className="text-[10px] text-slate-400">Desktop popups for direct messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={desktopPush}
                      onChange={(e) => {
                        setDesktopPush(e.target.checked);
                        triggerSaveNotification(`Push Notifications ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Security Status Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Security Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">Two-Factor Authentication</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      {twoFactorEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">Timezone</h4>
                    <span className="text-[10px] text-slate-400 block">{timezone}</span>
                  </div>
                  <Globe className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'security' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <span>Security & API Token Authorization</span>
              </h3>
              <p className="text-xs text-slate-400">Manage enterprise API keys and authentication status.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Live API Private Key</span>
                <button
                  onClick={handleRegenerateKey}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Key</span>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white">Change Account Password</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (currPassword && newPassword) {
                    setCurrPassword('');
                    setNewPassword('');
                    triggerSaveNotification('Password updated successfully!');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'billing' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Enterprise Billing & License</span>
              </h3>
              <p className="text-xs text-slate-400">Manage seat licenses, payment methods, and invoices.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Active Subscription Plan</span>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Pro Enterprise Plan</h4>
                  <p className="text-xs text-emerald-400 font-bold">$49 / user / month</p>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500 text-slate-950 uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Payment Method</span>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{cardHolder}</h4>
                  <p className="text-xs font-mono text-slate-400">{cardNumber}</p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('Payment method updated!')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Edit Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'workspace' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-400" />
                <span>Workspace Global Settings</span>
              </h3>
              <p className="text-xs text-slate-400">Workspace name, domains, and automated sprint policies.</p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Workspace Title</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Corporate Domain</label>
              <input
                type="text"
                value={workspaceDomain}
                onChange={(e) => setWorkspaceDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Sprint Auto-Archive Interval (Days)</label>
              <input
                type="number"
                value={autoArchiveDays}
                onChange={(e) => setAutoArchiveDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => triggerSaveNotification('Workspace Configuration Saved!')}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold flex items-center gap-2 transition shadow-lg shadow-violet-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Workspace Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
