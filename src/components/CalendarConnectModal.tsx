import React, { useState } from 'react';
import { Calendar, CheckCircle2, RefreshCw, X, Link, Clock, ExternalLink, ShieldCheck } from 'lucide-react';

interface CalendarConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const CalendarConnectModal: React.FC<CalendarConnectModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'saibhavaniyedla35@gmail.com',
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsConnected(!isConnected);
      setIsSyncing(false);
      setSyncStatusMsg(!isConnected ? 'Google Calendar successfully connected!' : 'Calendar disconnected.');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }, 800);
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Synced 14 sprint deadlines & 3 standup events with Google Calendar.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0e111a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Calendar Integration</h2>
              <p className="text-xs text-slate-400">Sync sprint deadlines, standups & reviews</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {syncStatusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Connected Account</span>
                <span className="text-xs font-mono text-blue-400">{userEmail}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  isConnected
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {isConnected ? 'Connected & Active' : 'Disconnected'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <button
                onClick={handleToggleConnect}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isConnected
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                }`}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isConnected ? (
                  'Disconnect Calendar'
                ) : (
                  'Connect Google Calendar'
                )}
              </button>

              {isConnected && (
                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
                  <span>Sync Now</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calendar Sync Preferences
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Sync Task Deadlines</h4>
                <p className="text-[11px] text-slate-400">
                  Automatically create events on Google Calendar when task due dates are assigned
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Google Meet Links</h4>
                <p className="text-[11px] text-slate-400">
                  Attach Google Meet video links to all scheduled sprint standups
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
