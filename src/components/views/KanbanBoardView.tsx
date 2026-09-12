import React, { useState } from 'react';
import { Plus, MoreHorizontal, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Task, TeamMember, TaskStatus } from '../../types';
import { TaskCard } from '../TaskCard';

interface KanbanBoardViewProps {
  tasks: Task[];
  members: TeamMember[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badgeBg: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-300', badgeBg: 'bg-slate-200 text-slate-700' },
  { id: 'todo', label: 'To Do', color: 'border-blue-400', badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'in-progress', label: 'In Progress', color: 'border-amber-400', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'review', label: 'Review', color: 'border-purple-400', badgeBg: 'bg-purple-100 text-purple-800' },
  { id: 'done', label: 'Done', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  members,
  onSelectTask,
  onStatusChange,
  onDeleteTask,
  onOpenNewTaskWithStatus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 lg:p-6 bg-slate-100/60 min-h-[calc(100vh-112px)]">
      <div className="flex gap-4 min-w-[1200px] h-full items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const totalPoints = colTasks.reduce((acc, t) => acc + t.storyPoints, 0);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={handleDragLeave}
              className={`w-72 sm:w-80 shrink-0 bg-slate-100/80 rounded-2xl border ${
                isOver ? 'border-blue-500 bg-blue-50/40 shadow-md' : 'border-slate-200/80'
              } flex flex-col max-h-[calc(100vh-140px)] transition duration-150`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/60 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-4 rounded-full border-l-4 ${col.color}`} />
                  <h3 className="font-bold text-slate-800 text-sm">{col.label}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{totalPoints} pts</span>
                  <button
                    onClick={() => onOpenNewTaskWithStatus(col.id)}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-600 transition"
                    title="Add task to column"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-3 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard
                        task={task}
                        members={members}
                        onSelectTask={onSelectTask}
                        onStatusChange={onStatusChange}
                        onDeleteTask={onDeleteTask}
                      />
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 font-medium my-2">
                    No tasks in {col.label}.
                    <button
                      onClick={() => onOpenNewTaskWithStatus(col.id)}
                      className="block mx-auto mt-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      + Add item
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
