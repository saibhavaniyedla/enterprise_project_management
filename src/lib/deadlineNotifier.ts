import { Task, TeamMember, Project } from '../types';

export interface EmailNotification {
  id: string;
  taskId: string;
  taskKey: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  hoursRemaining: number;
  dueDate: string;
  sentAt: string;
  read: boolean;
}

const STORAGE_KEY = 'fusionsprint_email_notifications';

export function getSentEmailNotifications(): EmailNotification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveEmailNotifications(notifications: EmailNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    // Dispatch real-time event for UI listeners
    window.dispatchEvent(new CustomEvent('email_notification_sent', { detail: notifications }));
  } catch (err) {
    console.warn('Could not save email notifications to localStorage', err);
  }
}

/**
 * Checks all tasks and triggers email alerts for deadlines within 24 hours to ALL team members automatically.
 */
export function checkAndSendDeadlineAlerts(
  tasks: Task[],
  members: TeamMember[],
  projects: Project[]
): { newAlerts: EmailNotification[]; totalSent: number } {
  const existingNotifications = getSentEmailNotifications();
  const sentKeys = new Set(existingNotifications.map((n) => `${n.taskId}_${n.dueDate}_${n.recipientEmail}`));
  const now = new Date();
  const newNotifications: EmailNotification[] = [];

  for (const task of tasks) {
    // Skip finished tasks
    if (task.status === 'done') continue;

    if (!task.dueDate) continue;

    // Calculate time difference
    let dueTimestamp: number;
    if (task.dueDate.includes('T')) {
      dueTimestamp = new Date(task.dueDate).getTime();
    } else {
      // YYYY-MM-DD -> end of that day (23:59:59)
      const parts = task.dueDate.split('-');
      if (parts.length === 3) {
        dueTimestamp = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          23,
          59,
          59
        ).getTime();
      } else {
        dueTimestamp = new Date(task.dueDate).getTime();
      }
    }

    if (isNaN(dueTimestamp)) continue;

    const diffMs = dueTimestamp - now.getTime();
    const hoursRemaining = diffMs / (1000 * 60 * 60);

    // Trigger alert if deadline is within 24 hours (or overdue up to 48h)
    if (hoursRemaining <= 24 && hoursRemaining >= -48) {
      const project = projects.find((p) => p.id === task.projectId) || projects[0];
      const isOverdue = hoursRemaining < 0;
      const formattedHours = isOverdue
        ? `Overdue by ${Math.abs(Math.round(hoursRemaining))} hour(s)`
        : `Due in ${Math.round(hoursRemaining)} hour(s)`;

      // Dispatch automated email notification to EVERY team member
      for (const member of members) {
        const memberEmail = member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@acme.corp`;
        const dedupeKey = `${task.id}_${task.dueDate}_${memberEmail}`;

        if (!sentKeys.has(dedupeKey)) {
          const subject = `🚨 [Automated Team Alert] Task ${task.key} "${task.title}" ${formattedHours}`;
          const body = `Hello ${member.name},\n\nThis is an automated team-wide deadline notification from the Acme Sprint Control Center.\n\nTask: [${task.key}] ${task.title}\nProject: ${project?.name || 'Enterprise Workspace'}\nDeadline: ${task.dueDate} (${formattedHours})\nStatus: ${task.status.toUpperCase()}\nPriority: ${task.priority}\n\nAll team members are being notified automatically to ensure delivery tracking.\n\nBest regards,\nAcme Automated Sprint Dispatcher`;

          const alert: EmailNotification = {
            id: `email-auto-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            taskId: task.id,
            taskKey: task.key,
            taskTitle: task.title,
            projectId: task.projectId,
            projectName: project?.name || 'Enterprise System',
            recipientEmail: memberEmail,
            recipientName: member.name,
            subject,
            body,
            hoursRemaining: Math.round(hoursRemaining * 10) / 10,
            dueDate: task.dueDate,
            sentAt: new Date().toISOString(),
            read: false,
          };

          newNotifications.push(alert);
          sentKeys.add(dedupeKey);
        }
      }
    }
  }

  if (newNotifications.length > 0) {
    const updatedList = [...newNotifications, ...existingNotifications];
    saveEmailNotifications(updatedList);
  }

  return {
    newAlerts: newNotifications,
    totalSent: existingNotifications.length + newNotifications.length,
  };
}

/**
 * Manually trigger a test email notification for any given task
 */
export function sendManualTaskEmailAlert(
  task: Task,
  assignee: TeamMember,
  project?: Project
): EmailNotification {
  const existingNotifications = getSentEmailNotifications();
  const subject = `📩 [Manual Email Alert] Task ${task.key}: "${task.title}"`;
  const body = `Hello ${assignee.name},\n\nA manual email notification was dispatched for task [${task.key}] ${task.title}.\n\nDue Date: ${task.dueDate}\nPriority: ${task.priority}\nStatus: ${task.status}\n\nProject: ${project?.name || 'Enterprise Project'}`;

  const alert: EmailNotification = {
    id: `email-manual-${Date.now()}`,
    taskId: task.id,
    taskKey: task.key,
    taskTitle: task.title,
    projectId: task.projectId,
    projectName: project?.name || 'Enterprise Project',
    recipientEmail: assignee.email || `${assignee.name.toLowerCase().replace(/\s+/g, '.')}@acme.corp`,
    recipientName: assignee.name,
    subject,
    body,
    hoursRemaining: 12,
    dueDate: task.dueDate,
    sentAt: new Date().toISOString(),
    read: false,
  };

  const updated = [alert, ...existingNotifications];
  saveEmailNotifications(updated);
  return alert;
}

/**
 * Dispatches an official email invitation & confirmation to a newly added team member.
 */
export function sendTeamMemberInviteEmail(params: {
  name: string;
  email: string;
  role: string;
  assignedProjectNames: string[];
  workspaceName: string;
  password: string;
}): EmailNotification {
  const existingNotifications = getSentEmailNotifications();
  const subject = `🎉 [Workspace Invitation] You have been added to ${params.workspaceName}`;
  const projectsListStr = params.assignedProjectNames.length > 0
    ? params.assignedProjectNames.join(', ')
    : 'Default Workspace Project';

  const body = `Hello ${params.name},\n\nYou have been officially invited to join "${params.workspaceName}" as a ${params.role}.\n\nYOUR ASSIGNED PROJECT(S):\n• ${projectsListStr}\n\nLOGIN INSTRUCTIONS:\n1. Open the Sprint Flow Workspace portal.\n2. Enter your email: ${params.email}\n3. Password: ${params.password}\n\nSECURITY SCOPE:\nYour account is configured with scoped permissions. You will see ONLY your assigned project(s) upon logging in.\n\nWelcome aboard!\n${params.workspaceName} Engineering Management`;

  const inviteAlert: EmailNotification = {
    id: `email-invite-${Date.now()}`,
    taskId: 'INVITE',
    taskKey: 'TEAM-INVITE',
    taskTitle: `Workspace Invite for ${params.name}`,
    projectId: 'INVITE-PROJ',
    projectName: params.workspaceName,
    recipientEmail: params.email,
    recipientName: params.name,
    subject,
    body,
    hoursRemaining: 0,
    dueDate: new Date().toISOString().split('T')[0],
    sentAt: new Date().toISOString(),
    read: false,
  };

  const updated = [inviteAlert, ...existingNotifications];
  saveEmailNotifications(updated);
  return inviteAlert;
}
