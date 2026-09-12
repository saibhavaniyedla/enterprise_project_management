import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2,
  GitBranch,
  GitPullRequest,
  ExternalLink,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  GitCommit,
  X,
  Star,
  GitFork,
  Radio,
  Zap,
  Filter,
  Check,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Project } from '../../types';
import {
  fetchGitHubProjectData,
  GitHubProjectData,
  GitHubCommit,
  GitHubPullRequest,
  GitHubEventActivity,
} from '../../lib/githubService';

interface DevHubViewProps {
  projects?: Project[];
  currentProject?: Project | null;
}

// Map project IDs to default repos
const DEFAULT_PROJECT_REPOS: Record<string, string> = {
  'proj-1': 'FusionSprint/enterprise-project-management-saas',
  'proj-2': 'acme/auth-service',
  'proj-3': 'acme/k8s-infrastructure',
  'proj-4': 'vercel/next.js',
};

export const DevHubView: React.FC<DevHubViewProps> = ({
  projects = [],
  currentProject,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'prs' | 'activity' | 'pipelines'>('overview');
  const [isConnectGithubOpen, setIsConnectGithubOpen] = useState(false);
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [patToken, setPatToken] = useState('');
  const [showPatInput, setShowPatInput] = useState(false);
  
  // Per-project repo mapping
  const [projectRepoMap, setProjectRepoMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('project_github_repos');
      return saved ? JSON.parse(saved) : DEFAULT_PROJECT_REPOS;
    } catch {
      return DEFAULT_PROJECT_REPOS;
    }
  });

  // Current active repository for selected project
  const activeRepo = currentProject
    ? projectRepoMap[currentProject.id] || DEFAULT_PROJECT_REPOS[currentProject.id] || 'FusionSprint/enterprise-project-management-saas'
    : 'FusionSprint/enterprise-project-management-saas';

  // Real-time GitHub state
  const [githubData, setGithubData] = useState<GitHubProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [prFilter, setPrFilter] = useState<'all' | 'open' | 'merged'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch real-time data from GitHub
  const loadGitHubData = useCallback(async (repo: string, showLoader = false) => {
    if (showLoader) setIsLoading(true);
    setIsRefreshing(true);

    const data = await fetchGitHubProjectData(repo, patToken || undefined);
    setGithubData(data);
    setIsLoading(false);
    setIsRefreshing(false);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastRefreshedAt(timeStr);
  }, [patToken]);

  // Sync on project or repo change
  useEffect(() => {
    loadGitHubData(activeRepo, true);
  }, [activeRepo, loadGitHubData]);

  // Auto refresh interval (every 30 seconds if autoRefresh is active)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadGitHubData(activeRepo, false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeRepo, loadGitHubData]);

  // Connect new repository submit
  const handleConnectGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepoInput) return;

    const cleanRepo = githubRepoInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const projectId = currentProject?.id || 'proj-1';

    const updatedMap = { ...projectRepoMap, [projectId]: cleanRepo };
    setProjectRepoMap(updatedMap);
    try {
      localStorage.setItem('project_github_repos', JSON.stringify(updatedMap));
    } catch (e) {
      console.warn('Could not save repo map to localStorage', e);
    }

    setNotification(`Successfully connected project "${currentProject?.name || 'Default'}" to GitHub repo "${cleanRepo}"!`);
    setIsConnectGithubOpen(false);
    setGithubRepoInput('');
    loadGitHubData(cleanRepo, true);

    setTimeout(() => setNotification(null), 5000);
  };

  // Helper for formatting time ago
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return `${Math.floor(diffSecs / 86400)}d ago`;
    } catch {
      return 'recently';
    }
  };

  // Pipelines list correlated with GitHub commits
  const pipelines = [
    {
      id: 'build-9042',
      repo: activeRepo,
      branch: githubData?.repoSummary.defaultBranch || 'main',
      trigger: `Commit ${githubData?.commits[0]?.sha || 'a8f9c1e'} by ${githubData?.commits[0]?.author.name || 'Alex Rivera'}`,
      status: 'success',
      duration: '1m 45s',
      time: githubData?.commits[0] ? formatTimeAgo(githubData.commits[0].date) : '12 mins ago',
    },
    {
      id: 'build-9041',
      repo: 'acme/auth-service',
      branch: 'main',
      trigger: 'Push by Sarah Chen',
      status: 'success',
      duration: '2m 14s',
      time: '25 mins ago',
    },
    {
      id: 'build-9040',
      repo: 'acme/k8s-infrastructure',
      branch: 'feature/sprint-24',
      trigger: 'PR #142 update by Marcus Vance',
      status: 'running',
      duration: '1m 05s',
      time: 'In progress',
    },
  ];

  const filteredPRs = githubData?.pullRequests.filter((pr) => {
    if (prFilter === 'open') return pr.state === 'open';
    if (prFilter === 'merged') return pr.state === 'merged';
    return true;
  }) || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>Real-Time GitHub Service</span>
            </span>

            {currentProject && (
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                Project: <strong className="text-white">{currentProject.name}</strong>
              </span>
            )}

            {githubData?.repoSummary.isLive ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live GitHub API
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400" />
                Sync Mode Active
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-violet-400 shrink-0" />
            <span>Developer Hub & GitHub Pipeline</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadGitHubData(activeRepo, false)}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
            title="Refresh GitHub real-time data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle 30s auto refresh"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Auto-Sync {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              setGithubRepoInput(activeRepo);
              setIsConnectGithubOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 transition"
          >
            <GitBranch className="w-4 h-4" />
            <span>Configure Repo</span>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('commits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'commits'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commits ({githubData?.commits.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('prs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'prs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PRs ({githubData?.pullRequests.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Activity Stream
            </button>
            <button
              onClick={() => setActiveTab('pipelines')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'pipelines'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CI/CD
            </button>
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Fetching real-time GitHub repository data...</p>
          <span className="text-xs text-slate-500 font-mono">Syncing {activeRepo}</span>
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && githubData && (
            <div className="space-y-6">
              {/* Connected Repository Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 space-y-5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400 shrink-0 shadow-inner">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <a
                          href={`https://github.com/${githubData.repoSummary.name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-lg font-black text-white hover:text-violet-400 transition flex items-center gap-1.5"
                        >
                          <span>{githubData.repoSummary.name}</span>
                          <ExternalLink className="w-4 h-4 text-slate-500 hover:text-white" />
                        </a>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          {githubData.repoSummary.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {githubData.repoSummary.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                        <span>Default Branch: <strong className="text-slate-200">{githubData.repoSummary.defaultBranch}</strong></span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {githubData.repoSummary.starsCount}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-400" /> {githubData.repoSummary.forksCount}</span>
                        <span>Updated: {lastRefreshedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 shrink-0">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Commits</span>
                      <span className="text-xl sm:text-2xl font-black text-violet-400">{githubData.repoSummary.totalCommits}</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Open PRs</span>
                      <span className="text-xl sm:text-2xl font-black text-purple-400">
                        {githubData.pullRequests.filter((p) => p.state === 'open').length}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Open Issues</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-400">{githubData.repoSummary.openIssuesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Latest Commit Ticker */}
                {githubData.commits[0] && (
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GitCommit className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded text-[11px] font-bold">
                        {githubData.commits[0].sha}
                      </span>
                      <span className="truncate text-slate-200">{githubData.commits[0].message}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
                      <span>By {githubData.commits[0].author.name}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(githubData.commits[0].date)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Commits & PRs Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-Time Commits Stream */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <GitCommit className="w-5 h-5 text-violet-400" />
                      <span>Recent Commits Activity</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('commits')}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300"
                    >
                      View All ({githubData.commits.length}) →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {githubData.commits.slice(0, 4).map((commit) => (
                      <a
                        key={commit.sha}
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition block space-y-1 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 shrink-0">
                              {commit.sha}
                            </span>
                            <span className="font-bold text-xs text-white truncate group-hover:text-violet-300 transition">
                              {commit.message}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5">
                            {commit.author.avatarUrl && (
                              <img
                                src={commit.author.avatarUrl}
                                alt={commit.author.name}
                                className="w-4 h-4 rounded-full border border-slate-700"
                              />
                            )}
                            <span>{commit.author.name}</span>
                          </div>
                          <span className="font-mono">{formatTimeAgo(commit.date)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Open Pull Requests */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <GitPullRequest className="w-5 h-5 text-purple-400" />
                      <span>Pull Requests Review Queue</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('prs')}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      View All ({githubData.pullRequests.length}) →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {githubData.pullRequests.slice(0, 4).map((pr) => (
                      <a
                        key={pr.id}
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition block space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-400">#{pr.number}</span>
                            <h4 className="font-bold text-xs text-white truncate group-hover:text-purple-300 transition">
                              {pr.title}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                              pr.state === 'open'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : pr.state === 'merged'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {pr.state}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Author: <strong className="text-slate-300">{pr.author.name}</strong></span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {pr.headBranch} → {pr.baseBranch}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Stream Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>Real-Time Events Activity Feed</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    Full Stream →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {githubData.activities.slice(0, 6).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <img
                            src={evt.actor.avatarUrl}
                            alt={evt.actor.login}
                            className="w-4 h-4 rounded-full"
                          />
                          <span>@{evt.actor.login}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{formatTimeAgo(evt.timestamp)}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{evt.description}</p>
                      {evt.details && (
                        <p className="text-[11px] font-mono text-slate-400 truncate bg-slate-900 p-1.5 rounded border border-slate-800">
                          {evt.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMMITS TAB */}
          {activeTab === 'commits' && githubData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Full Commit History for {githubData.repoSummary.name}
                </h2>
                <span className="text-xs font-mono text-slate-500">
                  Total Commits: <strong className="text-violet-400">{githubData.repoSummary.totalCommits}</strong>
                </span>
              </div>

              <div className="space-y-3">
                {githubData.commits.map((commit) => (
                  <div
                    key={commit.sha}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            {commit.sha}
                          </span>
                          <h3 className="font-bold text-white text-sm">{commit.message}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            {commit.author.avatarUrl && (
                              <img src={commit.author.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                            )}
                            <span className="text-slate-300 font-medium">{commit.author.name}</span>
                          </div>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{new Date(commit.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={commit.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-violet-400 flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <span>View Commit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PULL REQUESTS TAB */}
          {activeTab === 'prs' && githubData && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Pull Requests Queue for {githubData.repoSummary.name}
                </h2>

                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setPrFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${prFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    All ({githubData.pullRequests.length})
                  </button>
                  <button
                    onClick={() => setPrFilter('open')}
                    className={`px-3 py-1 rounded-lg transition ${prFilter === 'open' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    Open ({githubData.pullRequests.filter((p) => p.state === 'open').length})
                  </button>
                  <button
                    onClick={() => setPrFilter('merged')}
                    className={`px-3 py-1 rounded-lg transition ${prFilter === 'merged' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    Merged ({githubData.pullRequests.filter((p) => p.state === 'merged').length})
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPRs.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-purple-400">#{pr.number}</span>
                          <h3 className="font-bold text-white text-base">{pr.title}</h3>
                          {pr.isDraft && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Opened by <strong className="text-slate-200">{pr.author.name}</strong> • Updated {formatTimeAgo(pr.updatedAt)}
                        </p>
                      </div>

                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                      >
                        <span>GitHub PR</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                        <span>Branches: <strong className="text-slate-200">{pr.headBranch}</strong> → <strong className="text-slate-200">{pr.baseBranch}</strong></span>
                      </div>

                      {pr.reviewers && pr.reviewers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">Reviewers:</span>
                          <span className="text-violet-300 font-semibold">{pr.reviewers.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITY STREAM TAB */}
          {activeTab === 'activity' && githubData && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                GitHub Event Stream for {githubData.repoSummary.name}
              </h2>

              <div className="space-y-3">
                {githubData.activities.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4"
                  >
                    <img
                      src={evt.actor.avatarUrl}
                      alt=""
                      className="w-9 h-9 rounded-full border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">@{evt.actor.login}</span>
                        <span className="text-[11px] font-mono text-slate-500">{formatTimeAgo(evt.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{evt.description}</p>
                      {evt.details && (
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 mt-1">
                          {evt.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CI/CD PIPELINES TAB */}
          {activeTab === 'pipelines' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                CI/CD Automated Build Matrix
              </h2>
              <div className="space-y-3">
                {pipelines.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {p.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-300">{p.id}</span>
                          <span className="text-xs font-semibold text-blue-400">{p.repo}</span>
                          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            {p.branch}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{p.trigger}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span>⏱️ {p.duration}</span>
                      <span>{p.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Connect/Configure GitHub Modal */}
      {isConnectGithubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleConnectGithub}
            className="bg-[#0e111a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-white text-base">
                  Connect Repository for {currentProject?.name || 'Project'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConnectGithubOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                GitHub Repository (owner/repo)
              </label>
              <input
                type="text"
                required
                value={githubRepoInput}
                onChange={(e) => setGithubRepoInput(e.target.value)}
                placeholder="e.g. facebook/react, vercel/next.js, or owner/repo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enter any public GitHub repository (e.g., <code className="text-violet-300">facebook/react</code>, <code className="text-violet-300">vercel/next.js</code>) or your team's repo.
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowPatInput(!showPatInput)}
                className="text-xs text-violet-400 font-bold flex items-center gap-1 hover:underline"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showPatInput ? 'Hide' : 'Add'} Optional Personal Access Token (for high rate limit)</span>
              </button>

              {showPatInput && (
                <div className="mt-2 space-y-1">
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    GitHub PAT unlocks 5,000 requests/hour for private or high-volume repositories.
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                Real-Time Features Enabled:
              </span>
              <p>• Live commit activity counter & commit message stream</p>
              <p>• Pull Request status, state filtering, and reviewer queue</p>
              <p>• Event activity feed with real-time timestamps</p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConnectGithubOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md"
              >
                Sync & Connect Repository
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
