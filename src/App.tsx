import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, MainTab } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { TeamView } from './components/views/TeamView';
import { MeetingsView } from './components/views/MeetingsView';
import { DevHubView } from './components/views/DevHubView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { InboxView } from './components/views/InboxView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';
import { FavoritesView } from './components/views/FavoritesView';
import { LoginView, UserSession } from './components/views/LoginView';

// Modals
import { NewTaskModal } from './components/NewTaskModal';
import { TaskModal } from './components/TaskModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { TeamDirectoryModal } from './components/TeamDirectoryModal';
import { CalendarConnectModal } from './components/CalendarConnectModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AboutProjectModal } from './components/AboutProjectModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';

import {
  Workspace,
  Project,
  Sprint,
  TeamMember,
  Task,
  TaskStatus,
  ActivityLog,
} from './types';
import {
  subscribeWorkspaces,
  subscribeProjects,
  subscribeSprints,
  subscribeMembers,
  subscribeTasks,
  subscribeActivities,
  subscribePresence,
  createTaskInDb,
  updateTaskInDb,
  deleteTaskInDb,
  deleteMemberInDb,
  addCommentInDb,
  createWorkspaceInDb,
  createProjectInDb,
  updateProjectInDb,
  sendPresenceHeartbeat,
  seedWorkspaceWithDemoData,
} from './lib/api';
import {
  checkAndSendDeadlineAlerts,
  sendManualTaskEmailAlert,
} from './lib/deadlineNotifier';
import { checkAndAutoArchiveSprints } from './lib/sprintAutoArchive';
import {
  onAuthStateChange,
  logoutUser,
  UserScopedData,
} from './lib/userAuthEngine';

export function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Core Data States (Real-Time Synced with Firestore)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; userName: string; userAvatar: string }[]>([]);

  // User details derived from logged in session
  const userName = currentUser?.name || 'Workspace User';
  const userRole = currentUser?.role || 'Product Manager & Architect';
  const userAvatar =
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

  // Navigation & Workspace Lock State
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isWorkspaceUnlocked, setIsWorkspaceUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('fusionsprint_workspace_unlocked') === 'true';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Custom User Profile override state
  const [customProfile, setCustomProfile] = useState<{
    name?: string;
    role?: string;
    avatar?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('fusionsprint_user_profile');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const effectiveUserName = customProfile.name || userName;
  const effectiveUserRole = customProfile.role || userRole;
  const effectiveUserAvatar = customProfile.avatar || userAvatar;

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [isTeamDirOpen, setIsTeamDirOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [presetStatus, setPresetStatus] = useState<TaskStatus | undefined>();

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((session) => {
      setCurrentUser(session);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Subscription: Workspaces for currentUser
  useEffect(() => {
    if (!currentUser?.id) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return;
    }

    const unsubWorkspaces = subscribeWorkspaces(currentUser.id, async (fetchedWorkspaces) => {
      if (fetchedWorkspaces.length === 0) {
        // Automatically seed first workspace if empty
        const initialWs = await seedWorkspaceWithDemoData(
          currentUser.id,
          currentUser.name,
          currentUser.email,
          currentUser.avatar
        );
        setWorkspaces([initialWs]);
        setCurrentWorkspace(initialWs);
      } else {
        setWorkspaces(fetchedWorkspaces);
        setCurrentWorkspace((prev) => {
          if (!prev) return fetchedWorkspaces[0];
          const exists = fetchedWorkspaces.find((w) => w.id === prev.id);
          return exists || fetchedWorkspaces[0];
        });
      }
    });

    return () => unsubWorkspaces();
  }, [currentUser?.id]);

  // 3. Real-time Subscriptions: Projects, Members, Activities, Presence for currentWorkspace
  useEffect(() => {
    if (!currentWorkspace?.id) {
      setProjects([]);
      setCurrentProject(null);
      setMembers([]);
      setActivities([]);
      setOnlineUsers([]);
      return;
    }

    const wsId = currentWorkspace.id;

    // Subscribe Projects
    const unsubProjects = subscribeProjects(wsId, (fetchedProjects) => {
      setProjects(fetchedProjects);
      setCurrentProject((prev) => {
        if (!prev) return fetchedProjects[0] || null;
        const exists = fetchedProjects.find((p) => p.id === prev.id);
        return exists || fetchedProjects[0] || null;
      });
    });

    // Subscribe Members
    const unsubMembers = subscribeMembers(wsId, (fetchedMembers) => {
      setMembers(fetchedMembers);
    });

    // Subscribe Activities
    const unsubActivities = subscribeActivities(wsId, (fetchedActivities) => {
      setActivities(fetchedActivities);
    });

    // Subscribe Real-Time Presence
    const unsubPresence = subscribePresence(wsId, (activeUsers) => {
      setOnlineUsers(activeUsers);
    });

    // Send initial presence heartbeat and keep sending every 30s
    if (currentUser?.id) {
      sendPresenceHeartbeat(wsId, {
        id: currentUser.id,
        name: effectiveUserName,
        avatar: effectiveUserAvatar,
      });
    }
    const heartbeatTimer = setInterval(() => {
      if (currentUser?.id) {
        sendPresenceHeartbeat(wsId, {
          id: currentUser.id,
          name: effectiveUserName,
          avatar: effectiveUserAvatar,
        });
      }
    }, 30000);

    return () => {
      unsubProjects();
      unsubMembers();
      unsubActivities();
      unsubPresence();
      clearInterval(heartbeatTimer);
    };
  }, [currentWorkspace?.id, currentUser?.id, effectiveUserName, effectiveUserAvatar]);

  // 4. Real-time Subscriptions: Tasks & Sprints for currentProject
  useEffect(() => {
    if (!currentWorkspace?.id || !currentProject?.id) {
      setTasks([]);
      setSprints([]);
      setCurrentSprint(null);
      return;
    }

    const wsId = currentWorkspace.id;
    const projId = currentProject.id;

    const unsubTasks = subscribeTasks(wsId, projId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      // Also update selectedTask if open
      setSelectedTask((prev) => {
        if (!prev) return null;
        return fetchedTasks.find((t) => t.id === prev.id) || null;
      });
    });

    const unsubSprints = subscribeSprints(wsId, projId, (fetchedSprints) => {
      setSprints(fetchedSprints);
      setCurrentSprint((prev) => {
        if (!prev) return fetchedSprints[0] || null;
        const exists = fetchedSprints.find((s) => s.id === prev.id);
        return exists || fetchedSprints[0] || null;
      });
    });

    return () => {
      unsubTasks();
      unsubSprints();
    };
  }, [currentWorkspace?.id, currentProject?.id]);

  // Background Engine 1: Sprint Auto-Archiver (Runs every 30s)
  const runSprintAutoArchive = useCallback(() => {
    if (sprints.length > 0 && projects.length > 0) {
      const result = checkAndAutoArchiveSprints(sprints, tasks, projects);
      if (result.archivedSprintIds.length > 0 || result.movedTasksCount > 0) {
        setSprints(result.updatedSprints);
        setTasks(result.updatedTasks);
      }
    }
  }, [sprints, tasks, projects]);

  // Background Engine 2: Task Deadline Email Alert Engine (Runs every 30s)
  const runDeadlineCheck = useCallback(() => {
    if (tasks.length > 0 && members.length > 0 && projects.length > 0) {
      checkAndSendDeadlineAlerts(tasks, members, projects);
    }
  }, [tasks, members, projects]);

  useEffect(() => {
    runSprintAutoArchive();
    runDeadlineCheck();
    const timer = setInterval(() => {
      runSprintAutoArchive();
      runDeadlineCheck();
    }, 30000);
    return () => clearInterval(timer);
  }, [runSprintAutoArchive, runDeadlineCheck]);

  // Login Success Handler
  const handleLoginSuccess = (session: UserSession, userScopedData?: UserScopedData) => {
    setCurrentUser(session);

    // Lock navigation initially so user starts on Dashboard to pick workspace
    setIsWorkspaceUnlocked(false);
    localStorage.setItem('fusionsprint_workspace_unlocked', 'false');
    setActiveTab('dashboard');

    if (userScopedData) {
      setWorkspaces(userScopedData.workspaces);
      setCurrentWorkspace(userScopedData.workspaces[0] || null);

      setProjects(userScopedData.projects);
      setCurrentProject(userScopedData.projects[0] || null);

      setSprints(userScopedData.sprints);
      setCurrentSprint(userScopedData.sprints[0] || null);

      setMembers(userScopedData.members);
      setTasks(userScopedData.tasks);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsWorkspaceUnlocked(false);
    localStorage.removeItem('fusionsprint_workspace_unlocked');
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setIsWorkspaceUnlocked(true);
    localStorage.setItem('fusionsprint_workspace_unlocked', 'true');
  };

  const handleSelectProject = (proj: Project) => {
    setCurrentProject(proj);
    setIsWorkspaceUnlocked(true);
    localStorage.setItem('fusionsprint_workspace_unlocked', 'true');
  };

  // Dynamic Workspace Creation Handler (Persistent in Firestore)
  const handleCreateWorkspace = async (name: string, description: string) => {
    if (!currentUser?.id) return;
    const newWs = await createWorkspaceInDb(name, description, currentUser.id);
    setCurrentWorkspace(newWs);
    setIsWorkspaceUnlocked(true);
    localStorage.setItem('fusionsprint_workspace_unlocked', 'true');
  };

  // Dynamic Project Creation Handler (Persistent in Firestore)
  const handleCreateProject = async (
    name: string,
    key: string,
    description: string,
    workspaceId: string
  ) => {
    const newProj = await createProjectInDb(workspaceId, {
      name,
      key,
      description,
      ownerId: currentUser?.id,
    });
    setCurrentProject(newProj);
    setIsWorkspaceUnlocked(true);
    localStorage.setItem('fusionsprint_workspace_unlocked', 'true');
  };

  // Save Project README in Firestore
  const handleSaveReadme = async (newReadme: string) => {
    if (!currentWorkspace?.id || !currentProject?.id) return;
    await updateProjectInDb(currentWorkspace.id, currentProject.id, { readme: newReadme });
    setCurrentProject((prev) => (prev ? { ...prev, readme: newReadme } : null));
  };

  // Filter tasks based on selected project, sprint, and search query
  const filteredTasks = useMemo(() => {
    if (!currentProject) return tasks;
    return tasks.filter((t) => {
      const matchesProject = t.projectId === currentProject.id;
      if (!matchesProject) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesKey = t.key.toLowerCase().includes(q);
        const matchesTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        return matchesTitle || matchesKey || matchesTag;
      }

      return true;
    });
  }, [tasks, currentProject, searchQuery]);

  // Handlers for task mutations (Directly persisting to Firestore)
  const handleCreateTask = async (taskData: Partial<Task>) => {
    if (!currentWorkspace?.id || !currentProject?.id) return;
    const targetSprintId = currentSprint?.id || `sprint-${Date.now()}`;
    await createTaskInDb(
      currentWorkspace.id,
      currentProject.id,
      {
        ...taskData,
        sprintId: targetSprintId,
        status: presetStatus || taskData.status || 'todo',
      },
      {
        id: currentUser?.id || 'usr-default',
        name: effectiveUserName,
        avatar: effectiveUserAvatar,
      }
    );
    setPresetStatus(undefined);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!currentWorkspace?.id || !currentProject?.id) return;
    const oldTask = tasks.find((t) => t.id === taskId);
    await updateTaskInDb(
      currentWorkspace.id,
      currentProject.id,
      taskId,
      updates,
      oldTask,
      {
        id: currentUser?.id || 'usr-default',
        name: effectiveUserName,
        avatar: effectiveUserAvatar,
      }
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentWorkspace?.id || !currentProject?.id) return;
    const targetTask = tasks.find((t) => t.id === taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    await deleteTaskInDb(
      currentWorkspace.id,
      currentProject.id,
      taskId,
      targetTask?.title || 'Task',
      {
        id: currentUser?.id || 'usr-default',
        name: effectiveUserName,
        avatar: effectiveUserAvatar,
      }
    );
  };

  const handleAddComment = async (taskId: string, text: string) => {
    if (!currentWorkspace?.id || !currentProject?.id) return;
    await addCommentInDb(
      currentWorkspace.id,
      currentProject.id,
      taskId,
      text,
      {
        id: currentUser?.id || members[0]?.id || 'usr-default',
        name: effectiveUserName,
        avatar: effectiveUserAvatar,
      }
    );
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  const handleOpenNewTaskWithStatus = (status: TaskStatus) => {
    setPresetStatus(status);
    setIsNewTaskOpen(true);
  };

  const handleTriggerManualAlert = (task: Task) => {
    const assignee = members.find((m) => m.id === task.assigneeId) || members[0];
    const project = projects.find((p) => p.id === task.projectId) || currentProject || undefined;
    sendManualTaskEmailAlert(task, assignee, project);
  };

  const handleDeleteMember = useCallback(
    async (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (currentWorkspace?.id) {
        await deleteMemberInDb(currentWorkspace.id, memberId, member?.name, {
          id: currentUser?.id || 'user-admin',
          name: effectiveUserName,
          avatar: effectiveUserAvatar,
        });
      }
    },
    [currentWorkspace, currentUser, effectiveUserName, effectiveUserAvatar, members]
  );

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#090b10] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-300">Connecting to Firebase Real-time Engine...</h2>
      </div>
    );
  }

  // Render Login View if user is not authenticated
  if (!currentUser) {
    return <LoginView members={members} onLoginSuccess={handleLoginSuccess} />;
  }

  const tabTitles: Record<MainTab, string> = {
    dashboard: 'Workspace Control Center',
    projects: 'Projects & Sprint Management',
    team: 'Engineering Team Directory & Roles',
    meetings: 'Sprint Standups & Video Recordings',
    devhub: 'Developer Workflows & GitHub Hub',
    analytics: 'Sprint Velocity & Performance Metrics',
    inbox: 'WhatsApp Workspace Chat & Messages',
    favorites: 'Favorites & Bookmarked Shortcuts',
    settings: 'Settings & Workspace Security',
    profile: 'Profile Center & Deliverables',
  };

  return (
    <div className="min-h-screen bg-[#090b10] flex flex-row font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={2}
        userName={effectiveUserName}
        userRole={effectiveUserRole}
        userAvatar={effectiveUserAvatar}
        isWorkspaceUnlocked={isWorkspaceUnlocked}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <HeaderBar
          currentTabTitle={tabTitles[activeTab]}
          currentProject={currentProject}
          unreadCount={2}
          userName={effectiveUserName}
          userRole={effectiveUserRole}
          userAvatar={effectiveUserAvatar}
          onlineUsers={onlineUsers}
          onOpenNewTask={() => {
            setPresetStatus(undefined);
            setIsNewTaskOpen(true);
          }}
          onOpenInbox={() => setActiveTab('inbox')}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenEmailModal={() => setIsEmailModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Dynamic Main View Switcher */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              sprints={sprints}
              tasks={tasks}
              members={members}
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              currentProject={currentProject}
              currentSprint={currentSprint}
              isWorkspaceUnlocked={isWorkspaceUnlocked}
              onNavigateTab={setActiveTab}
              onOpenNewTask={() => {
                setPresetStatus(undefined);
                setIsNewTaskOpen(true);
              }}
              onOpenAIInsights={() => setIsAIInsightsOpen(true)}
              onSelectProject={handleSelectProject}
              onSelectWorkspace={handleSelectWorkspace}
              onSelectSprint={setCurrentSprint}
              onSelectTask={setSelectedTask}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
              onCreateWorkspace={handleCreateWorkspace}
              onCreateProject={handleCreateProject}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              currentProject={currentProject || projects[0]}
              onSelectProject={handleSelectProject}
              sprints={sprints}
              currentSprint={currentSprint || sprints[0]}
              onSelectSprint={setCurrentSprint}
              tasks={filteredTasks}
              members={members}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectTask={setSelectedTask}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onOpenNewTask={() => {
                setPresetStatus(undefined);
                setIsNewTaskOpen(true);
              }}
              onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
              onOpenAIInsights={() => setIsAIInsightsOpen(true)}
              onOpenTeamDirectory={() => setIsTeamDirOpen(true)}
              onSaveReadme={handleSaveReadme}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              members={members}
              tasks={tasks}
              projects={projects}
              sprints={sprints}
              currentWorkspace={currentWorkspace}
              onOpenCalendarConnect={() => setIsCalendarModalOpen(true)}
              onAddMember={(newMember) => {
                setMembers((prev) => [...prev, newMember]);
              }}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsView
              projects={projects}
              members={members}
              currentProject={currentProject}
            />
          )}

          {activeTab === 'devhub' && (
            <DevHubView
              projects={projects}
              currentProject={currentProject}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              tasks={filteredTasks}
              sprint={currentSprint}
              members={members}
              onOpenAIInsights={() => setIsAIInsightsOpen(true)}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              currentProject={currentProject}
              projects={projects}
              onSelectProject={handleSelectProject}
              userName={userName}
              userAvatar={userAvatar}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              projects={projects}
              tasks={tasks}
              onNavigateTab={setActiveTab}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userName={effectiveUserName}
              userRole={effectiveUserRole}
              userAvatar={effectiveUserAvatar}
              currentProject={currentProject}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              tasks={tasks}
              userName={effectiveUserName}
              userRole={effectiveUserRole}
              userAvatar={effectiveUserAvatar}
              onUpdateProfile={(updated) => {
                setCustomProfile(updated);
              }}
            />
          )}

          {/* Persistent Global Application Footer */}
          <Footer
            onNavigateHome={() => setActiveTab('dashboard')}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            onOpenContact={() => setIsContactModalOpen(true)}
          />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        tasks={tasks}
        projects={projects}
        members={members}
        onSelectTask={setSelectedTask}
        onSelectProject={handleSelectProject}
        onSelectTab={setActiveTab}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentUserEmail={currentUser?.email || 'saibhavaniyedla35@gmail.com'}
        currentUserName={effectiveUserName}
      />

      <AboutProjectModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setPresetStatus(undefined);
        }}
        currentProject={currentProject}
        currentSprint={currentSprint}
        members={members}
        onCreateTask={handleCreateTask}
      />

      <TaskModal
        task={selectedTask}
        members={members}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddComment={handleAddComment}
      />

      <AIInsightsModal
        isOpen={isAIInsightsOpen}
        onClose={() => setIsAIInsightsOpen(false)}
        currentSprint={currentSprint}
        currentProject={currentProject}
      />

      <TeamDirectoryModal
        isOpen={isTeamDirOpen}
        onClose={() => setIsTeamDirOpen(false)}
        members={members}
        tasks={tasks}
      />

      <CalendarConnectModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        userEmail="saibhavaniyedla35@gmail.com"
      />

      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        tasks={tasks}
        members={members}
        projects={projects}
        onTriggerManualAlert={handleTriggerManualAlert}
      />
    </div>
  );
}

export default App;
