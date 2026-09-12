export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  key: string; // e.g., "MIG-101", "PORT-204"
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  assigneeId: string;
  projectId: string;
  sprintId: string;
  startDate: string; // ISO date string YYYY-MM-DD
  dueDate: string;   // ISO date string YYYY-MM-DD
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  is_completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  status: 'active' | 'planned' | 'completed';
  startDate: string;
  endDate: string;
  goal: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  workspaceId: string;
  color: string;
  ownerId: string;
  dueDate?: string;
  status?: 'Planning' | 'In Progress' | 'Under Review' | 'Completed';
  progress?: number;
  readme?: string;
}

/**
 * Firestore Data Schema Model:
 * 
 * users/{userId} -> User Profile & workspace list
 * workspaces/{workspaceId} -> Workspace details & member IDs
 * workspaces/{workspaceId}/projects/{projectId} -> Project with readme & metadata
 * workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId} -> Task item
 * workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId} -> Sprint details
 * workspaces/{workspaceId}/projects/{projectId}/milestones/{milestoneId} -> Roadmap milestone
 * workspaces/{workspaceId}/members/{userId} -> Member metadata & capacity
 * workspaces/{workspaceId}/activity/{activityId} -> Workspace activity stream
 * workspaces/{workspaceId}/presence/{userId} -> Active board presence heartbeat
 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TeamWorkloadEntry {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  open_task_count: number;
  workload_percent: number; // rounded, uncapped in the number
  status_label: 'Available' | 'Steady' | 'At Capacity' | 'Overloaded';
}

export interface RoadmapPhase {
  id: string; // underlying calendar event id or milestone id
  name: string; // event title
  start_time: string; // ISO date / string
  end_time?: string;
  percent_complete: number; // 0-100
  status_label: 'Completed' | 'In Progress' | 'Next' | 'Backlog';
}

export interface MilestoneEvent {
  id: string;
  projectId: string;
  title: string;
  event_type: 'Milestone' | 'Meeting' | 'Review' | 'Release';
  start_time: string;
  end_time?: string;
  description?: string;
}

export interface ProjectStatsOut {
  task_count: number;
  tasks_by_status: Record<string, number>;
  overdue_task_count: number;
  upcoming_event_count: number;
  wiki_page_count: number;
  member_count: number;
  completed_task_count: number;
  health_score: number; // 0-100
  risk_level: RiskLevel;
  risk_reason: string;
  team_workload: TeamWorkloadEntry[];
  roadmap: RoadmapPhase[];
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Product Manager' | 'Lead Engineer' | 'Frontend Engineer' | 'Backend Engineer' | 'UX Designer' | 'QA Lead';
  avatar: string;
  capacityHours: number;
  assignedPoints: number;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskKey?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  timestamp: string;
}

export interface FilterState {
  searchQuery: string;
  assigneeId: string;
  priority: string;
  tag: string;
  status: string;
  sprintId: string;
}

export interface AIInsightResponse {
  sprintHealthScore: number; // 0 - 100
  summary: string;
  risks: {
    taskId?: string;
    taskKey?: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
  }[];
  bottlenecks: string[];
  actionItems: string[];
}
