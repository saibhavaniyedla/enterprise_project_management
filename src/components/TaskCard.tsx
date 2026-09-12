import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  MoreVertical,
  AlertCircle,
  Tag,
  User,
} from 'lucide-react';
import { Task, TeamMember } from '../types';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  members,
  onSelectTask,
  onStatusChange,
  onDeleteTask,
}) => {
  const assignee = members.find((m) => m.id === task.assigneeId);
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  const priorityColors = {
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className="group relative bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col gap-3"
    >
      {/* Top Header: Task Key, Priority Badge, Story Points */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-slate-500 tracking-wide bg-slate-100 px-1.5 py-0.5 rounded-sm">
            {task.key}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              priorityColors[task.priority] || priorityColors.Medium
            }`}
          >
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            {task.storyPoints} pts
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress Bar if any */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                completedSubtasks === task.subtasks.length
                  ? 'bg-emerald-500'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${
                  task.subtasks.length > 0
                    ? (completedSubtasks / task.subtasks.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due Date, Comments count, Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Due date */}
          <div className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{task.dueDate}</span>
          </div>

          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1 font-medium text-slate-600">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        <div
          className="flex items-center gap-1.5"
          title={assignee?.name || 'Unassigned'}
        >
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
