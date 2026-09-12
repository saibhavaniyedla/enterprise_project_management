import React, { useState } from 'react';
import {
  FolderKanban,
  LayoutGrid,
  CalendarDays,
  Table as TableIcon,
  BookOpen,
  BarChart3,
  Search,
  Plus,
  Sparkles,
  ChevronDown,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import { Project, Sprint, Task, TeamMember, TaskStatus } from '../../types';
import { ProjectOverviewSubView } from './ProjectOverviewSubView';
import { ProjectCalendarSubView } from './ProjectCalendarSubView';
import { WikiView } from './WikiView';
import { ProjectReadmeSubView } from './ProjectReadmeSubView';

import { KanbanBoardView } from './KanbanBoardView';
import { TimelineView } from './TimelineView';
import { TableView } from './TableView';

interface ProjectsViewProps {
  projects: Project[];
  currentProject: Project;
  onSelectProject: (p: Project) => void;
  sprints: Sprint[];
  currentSprint: Sprint;
  onSelectSprint: (s: Sprint) => void;
  tasks: Task[];
  members: TeamMember[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTask: (t: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onOpenNewTask: () => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
  onOpenAIInsights: () => void;
  onOpenTeamDirectory: () => void;
  onSaveReadme?: (newReadme: string) => Promise<void>;
}

export type ProjectsMainSubTab = 'overview' | 'tasks' | 'calendar' | 'wiki' | 'readme';
export type TasksSubView = 'board' | 'timeline' | 'calendar' | 'table';

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  sprints,
  currentSprint,
  onSelectSprint,
  tasks,
  members,
  searchQuery,
  onSearchChange,
  onSelectTask,
  onStatusChange,
  onDeleteTask,
  onUpdateTask,
  onOpenNewTask,
  onOpenNewTaskWithStatus,
  onOpenAIInsights,
  onOpenTeamDirectory,
  onSaveReadme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProjectsMainSubTab>('overview');
  const [tasksSubView, setTasksSubView] = useState<TasksSubView>('board');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#090b10] text-slate-100">
      {/* Top Main Projects Subtabs Header Bar */}
      <div className="px-4 lg:px-8 py-3 bg-[#0d0f17] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 select-none">
        {/* Left Subtabs: Overview | Tasks | Calendar | Wiki | README */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'tasks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('wiki')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'wiki'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wiki</span>
          </button>

          <button
            onClick={() => setActiveSubTab('readme')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'readme'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>README.md</span>
          </button>
        </div>

        {/* Context Controls when inside Tasks */}
        {activeSubTab === 'tasks' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: Board, Timeline, Calendar, Table */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setTasksSubView('board')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  tasksSubView === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setTasksSubView('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  tasksSubView === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setTasksSubView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  tasksSubView === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setTasksSubView('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  tasksSubView === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                List
              </button>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
              />
            </div>

            {/* Create Task */}
            <button
              onClick={onOpenNewTask}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Subtab View Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeSubTab === 'overview' && (
          <ProjectOverviewSubView
            projects={projects}
            currentProject={currentProject}
            onSelectProject={onSelectProject}
            tasks={tasks}
            members={members}
            sprints={sprints}
            onOpenNewTask={onOpenNewTask}
            onOpenAIInsights={onOpenAIInsights}
          />
        )}

        {activeSubTab === 'calendar' && (
          <ProjectCalendarSubView
            tasks={tasks}
            members={members}
            currentProject={currentProject}
          />
        )}

        {activeSubTab === 'wiki' && (
          <WikiView currentProject={currentProject} />
        )}

        {activeSubTab === 'readme' && (
          <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
            <ProjectReadmeSubView
              project={currentProject}
              onSaveReadme={onSaveReadme || (async () => {})}
            />
          </div>
        )}

        {activeSubTab === 'tasks' && (
          <div className="flex-1 flex flex-col min-h-0">
            {tasksSubView === 'board' && (
              <KanbanBoardView
                tasks={tasks}
                members={members}
                onSelectTask={onSelectTask}
                onStatusChange={onStatusChange}
                onDeleteTask={onDeleteTask}
                onOpenNewTaskWithStatus={onOpenNewTaskWithStatus}
              />
            )}

            {tasksSubView === 'timeline' && (
              <TimelineView
                tasks={tasks}
                sprint={currentSprint}
                members={members}
                onSelectTask={onSelectTask}
              />
            )}

            {tasksSubView === 'calendar' && (
              <ProjectCalendarSubView
                tasks={tasks}
                members={members}
                currentProject={currentProject}
              />
            )}

            {tasksSubView === 'table' && (
              <TableView
                tasks={tasks}
                members={members}
                onSelectTask={onSelectTask}
                onStatusChange={onStatusChange}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
