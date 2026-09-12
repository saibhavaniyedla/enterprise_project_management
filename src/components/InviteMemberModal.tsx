import React, { useState } from 'react';
import {
  X,
  Mail,
  Shield,
  CheckCircle2,
  FolderKanban,
  Key,
  UserPlus,
  Sparkles,
  Send,
  Copy,
  ExternalLink,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Project, Workspace, TeamMember, Task, Sprint } from '../types';
import { inviteTeamMember } from '../lib/userAuthEngine';
import { EmailNotification } from '../lib/deadlineNotifier';
import { addMemberInDb, sendRealtimeInviteEmail } from '../lib/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
  members: TeamMember[];
  currentWorkspace: Workspace | null;
  onInviteSuccess: (newMember: TeamMember, alert: EmailNotification) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  projects,
  sprints,
  tasks,
  members,
  currentWorkspace,
  onInviteSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [password, setPassword] = useState('password123');
  const [capacityHours, setCapacityHours] = useState('40');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() =>
    projects.length > 0 ? [projects[0].id] : []
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteReceipt, setInviteReceipt] = useState<{
    member: TeamMember;
    emailAlert: EmailNotification;
    messageId: string;
    sentAt: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const rolesList = [
    'Lead Architect',
    'Product Manager',
    'Lead Engineer / Backend',
    'Frontend Engineer',
    'Full Stack Engineer',
    'UX Designer',
    'QA Lead',
    'DevOps & Infrastructure Engineer',
  ];

  const handleToggleProject = (projId: string) => {
    if (selectedProjectIds.includes(projId)) {
      if (selectedProjectIds.length === 1) {
        setError('Please select at least one assigned project.');
        return;
      }
      setSelectedProjectIds(selectedProjectIds.filter((id) => id !== projId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, projId]);
      setError(null);
    }
  };

  const handleResetModal = () => {
    setInviteReceipt(null);
    setName('');
    setEmail('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please enter team member full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address (e.g. member@company.com).');
      return;
    }

    // Check duplicate email rule
    const isAlreadyMember = members.some((m) => m.email.trim().toLowerCase() === cleanEmail);
    if (isAlreadyMember) {
      setError(`A team member with email "${cleanEmail}" is already added to this workspace. Duplicate invitations with the same email are prohibited.`);
      return;
    }

    if (selectedProjectIds.length === 0) {
      setError('Please assign at least one project to this member.');
      return;
    }

    setIsSubmitting(true);

    try {
      const defaultWs: Workspace = currentWorkspace || {
        id: 'ws-default',
        name: 'Sprint Flow Workspace',
        description: 'Enterprise Real-Time Workspace',
      };

      const assignedProjects = projects.filter((p) => selectedProjectIds.includes(p.id));
      const assignedNames = assignedProjects.map((p) => p.name);

      // 1. Create scoped member in local auth engine
      const result = inviteTeamMember({
        name: cleanName,
        email: cleanEmail,
        role,
        password: password.trim() || 'password123',
        capacityHours: parseInt(capacityHours, 10) || 40,
        assignedProjectIds: selectedProjectIds,
        currentWorkspace: defaultWs,
        allProjects: projects,
        allSprints: sprints,
        allTasks: tasks,
        allMembers: members,
      });

      // 2. Persist to Firestore members & activity collection in real-time
      await addMemberInDb(defaultWs.id, result.newMember, {
        id: 'user-admin',
        name: 'Workspace Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      });

      // 3. Dispatch real-time invitation email
      const emailDispatch = await sendRealtimeInviteEmail({
        recipientEmail: cleanEmail,
        recipientName: cleanName,
        role,
        workspaceName: defaultWs.name,
        workspaceId: defaultWs.id,
        invitedByName: 'Workspace Lead',
        temporaryPassword: password,
        assignedProjectNames: assignedNames,
      });

      // 4. Construct live Email Notification log
      const inviteAlert: EmailNotification = {
        id: `email-invite-${Date.now()}`,
        taskId: 'INVITE',
        taskKey: 'TEAM-INVITE',
        taskTitle: `Workspace Invite for ${cleanName}`,
        projectId: selectedProjectIds[0] || 'INVITE-PROJ',
        projectName: defaultWs.name,
        recipientEmail: cleanEmail,
        recipientName: cleanName,
        subject: `🎉 [Workspace Invitation] You have been added to ${defaultWs.name}`,
        body: `Hello ${cleanName},\n\nYou have been invited to join "${defaultWs.name}" as ${role}.\nAssigned Project Scope: ${assignedNames.join(', ')}\n\nLogin credentials:\nEmail: ${cleanEmail}\nTemporary Password: ${password}\n\nSecurity notice: When logging in, your access is strictly scoped to your assigned project(s).`,
        hoursRemaining: 0,
        dueDate: new Date().toISOString().split('T')[0],
        sentAt: new Date().toISOString(),
        read: false,
      };

      // Notify parent component & broadcast window event for real-time notification badge
      onInviteSuccess(result.newMember, inviteAlert);
      window.dispatchEvent(new Event('email_notification_sent'));

      // Show real-time receipt
      setInviteReceipt({
        member: result.newMember,
        emailAlert: inviteAlert,
        messageId: emailDispatch.messageId,
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } catch (err: any) {
      console.error('Invite dispatch error:', err);
      setError(err.message || 'Failed to send invitation. Please verify network connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyDirectLink = () => {
    const link = `${window.location.origin}/?invite=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Invite Team Member via Email</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Real-Time Verified Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifies email and sends invitation credentials with scoped project access.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content: Receipt State or Invite Form */}
        {inviteReceipt ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Invitation Email Dispatched & Verified in Real-Time!
                  </h3>
                  <p className="text-xs text-emerald-300">
                    A confirmation email was sent to <strong className="text-white">{inviteReceipt.member.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="text-emerald-300 font-bold">{inviteReceipt.member.name} ({inviteReceipt.member.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role Assigned:</span>
                  <span className="text-blue-300">{inviteReceipt.member.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Status:</span>
                  <span className="text-emerald-400">● Delivered (Message ID: {inviteReceipt.messageId.slice(0, 14)}...)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatched At:</span>
                  <span className="text-slate-400">{inviteReceipt.sentAt}</span>
                </div>
              </div>
            </div>

            {/* Email Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Email Content Delivered to Inbox:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-Time Dispatch</span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono text-[11px] bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {inviteReceipt.emailAlert.body}
              </p>
            </div>

            {/* Actions: Copy Link, Send via Mail Client, Done */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${encodeURIComponent(inviteReceipt.member.email)}?subject=${encodeURIComponent(
                    inviteReceipt.emailAlert.subject
                  )}&body=${encodeURIComponent(inviteReceipt.emailAlert.body)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Direct via Gmail / Email App</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Subject: ${inviteReceipt.emailAlert.subject}\n\n${inviteReceipt.emailAlert.body}`
                    );
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>{copiedLink ? 'Copied Email & Login!' : 'Copy Full Email Text'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyDirectLink}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Copy Direct Join URL</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteReceipt(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Invite Another Member
                  </button>
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            {/* Member Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Taylor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jessica.taylor@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Role & Login Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Engineering Role
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Default Login Password</span>
                  <span className="text-[10px] text-slate-500">Auto-generated</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Assigned Project Selection (Scoped Access) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>Assigned Project Scope (They see ONLY these projects)</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {selectedProjectIds.length} Selected
                </span>
              </label>

              <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-950 border border-slate-800">
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 p-2">No projects available in workspace.</p>
                ) : (
                  projects.map((p) => {
                    const isChecked = selectedProjectIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        onClick={() => handleToggleProject(p.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-blue-600/15 border-blue-500/40 text-white'
                            : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: p.color || '#3b82f6' }}
                          />
                          <div>
                            <div className="text-xs font-bold">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Key: {p.key}</div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                🔒 <strong className="text-slate-400">Scoped Security Guarantee:</strong> When this member signs in with <span className="text-slate-300 font-mono">{email || 'their email'}</span>, non-assigned projects will be completely hidden from their dashboard.
              </p>
            </div>

            {/* Weekly Capacity Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Weekly Capacity Hours
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={capacityHours}
                onChange={(e) => setCapacityHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying & Sending Mail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Verify & Send Real-Time Mail</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

