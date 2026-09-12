import React from 'react';
import { X, Users, Mail, Award, CheckCircle, Clock } from 'lucide-react';
import { TeamMember, Task } from '../types';

interface TeamDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  tasks: Task[];
}

export const TeamDirectoryModal: React.FC<TeamDirectoryModalProps> = ({
  isOpen,
  onClose,
  members,
  tasks,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Engineering Team Directory & Workload
              </h2>
              <p className="text-xs text-slate-500">
                {members.length} team members active in current workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
            const totalPoints = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
            const completedPoints = memberTasks
              .filter((t) => t.status === 'done')
              .reduce((acc, t) => acc + t.storyPoints, 0);

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 shadow-2xs flex flex-col gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold truncate">
                      {member.role}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Active Capacity
                    </span>
                    <span className="font-bold text-slate-700">
                      {member.capacityHours} hrs / wk
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Assigned Points
                    </span>
                    <span className="font-bold text-slate-700">
                      {completedPoints} / {totalPoints} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-xs text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
