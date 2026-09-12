import React, { useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { Task, TeamMember, TaskStatus, Priority } from '../../types';

interface TableViewProps {
  tasks: Task[];
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tasks,
  members,
  onSelectTask,
  onStatusChange,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [sortField, setSortField] = useState<'key' | 'title' | 'priority' | 'storyPoints' | 'dueDate'>('key');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const priorityRank: Record<Priority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

  const sortedTasks = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'key') cmp = a.key.localeCompare(b.key);
    else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'priority') cmp = priorityRank[b.priority] - priorityRank[a.priority];
    else if (sortField === 'storyPoints') cmp = b.storyPoints - a.storyPoints;
    else if (sortField === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const priorityColors = {
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/70 min-h-[calc(100vh-112px)]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-3 w-10 text-center">Done</th>
              <th
                onClick={() => handleSort('key')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Key</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4">Status</th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4">Assignee</th>
              <th
                onClick={() => handleSort('storyPoints')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Points</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('dueDate')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedTasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition group"
                >
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(task.is_completed)}
                      onChange={(e) => {
                        if (onUpdateTask) {
                          onUpdateTask(task.id, { is_completed: e.target.checked });
                        }
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      title={task.is_completed ? 'Mark as incomplete' : 'Mark as completed'}
                    />
                  </td>
                  <td
                    onClick={() => onSelectTask(task)}
                    className="py-3.5 px-4 font-mono font-bold text-xs text-slate-500 cursor-pointer"
                  >
                    {task.key}
                  </td>
                  <td
                    onClick={() => onSelectTask(task)}
                    className="py-3.5 px-4 font-semibold text-slate-800 cursor-pointer max-w-sm truncate group-hover:text-blue-600 transition"
                  >
                    {task.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {assignee ? (
                        <>
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-xs font-medium text-slate-700">
                            {assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {task.storyPoints}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                    {task.dueDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete task ${task.key}?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
