import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Tag,
  Trash2,
  Send,
  AlertCircle,
  User,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Task, TeamMember, TaskStatus, Priority } from '../types';

interface TaskModalProps {
  task: Task | null;
  members: TeamMember[];
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddComment: (taskId: string, text: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  members,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!task) return null;

  const assignee = members.find((m) => m.id === task.assigneeId);

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onUpdateTask(task.id, {
      subtasks: [...(task.subtasks || []), newSub],
    });
    setNewSubtaskTitle('');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment.trim());
    setNewComment('');
  };

  const statuses: { label: string; value: TaskStatus }[] = [
    { label: 'Backlog', value: 'backlog' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Review', value: 'review' },
    { label: 'Done', value: 'done' },
  ];

  const priorities: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono bg-slate-200/80 text-slate-700 px-2 py-1 rounded-md">
              {task.key}
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {task.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${task.key}?`)) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col md:flex-row gap-6">
          {/* Main Left Pane: Description, Subtasks, Comments */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title & Description */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {task.title}
              </h2>
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </div>
            </div>

            {/* Subtasks Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/
                  {task.subtasks.length})
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {task.subtasks.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition text-sm text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`flex-1 ${
                        st.completed ? 'line-through text-slate-400 font-normal' : 'font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                ))}

                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Add a new subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Activity & Comments
              </h4>

              <div className="flex flex-col gap-3 mb-4">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((com) => (
                    <div
                      key={com.id}
                      className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <img
                        src={com.authorAvatar}
                        alt={com.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800">
                            {com.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {com.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{com.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    No comments yet. Start the conversation below.
                  </div>
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Right Pane: Metadata controls */}
          <div className="w-full md:w-64 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            {/* Completed Toggle Button / Checkbox */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="task-modal-is-completed-toggle"
                  checked={Boolean(task.is_completed)}
                  onChange={(e) =>
                    onUpdateTask(task.id, { is_completed: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {task.is_completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 inline" />
                    )}
                    <span>{task.is_completed ? 'Completed' : 'Mark as Completed'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {task.is_completed
                      ? 'Task counted as done in Health Score'
                      : 'Independent of task status'}
                  </div>
                </div>
              </label>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) =>
                  onUpdateTask(task.id, { status: e.target.value as TaskStatus })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Assignee
              </label>
              <select
                value={task.assigneeId}
                onChange={(e) =>
                  onUpdateTask(task.id, { assigneeId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) =>
                  onUpdateTask(task.id, { priority: e.target.value as Priority })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Story Points
              </label>
              <input
                type="number"
                min="1"
                max="21"
                value={task.storyPoints}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    storyPoints: Number(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) =>
                  onUpdateTask(task.id, { dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
