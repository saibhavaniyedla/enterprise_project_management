import { Sprint, Task, Project, ActivityLog } from '../types';

export interface AutoArchiveResult {
  archivedSprintIds: string[];
  movedTasksCount: number;
  newSprintCreated: boolean;
  updatedSprints: Sprint[];
  updatedTasks: Task[];
  logs: string[];
}

const STORAGE_KEY_LOGS = 'fusionsprint_archive_logs';

export function getAutoArchiveLogs(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveAutoArchiveLogs(logs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.warn('Could not save archive logs', err);
  }
}

/**
 * Background Service to automatically archive expired sprints
 * and move unfinished tasks to the next active or newly created sprint.
 */
export function checkAndAutoArchiveSprints(
  sprints: Sprint[],
  tasks: Task[],
  projects: Project[]
): AutoArchiveResult {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let sprintsCopy = [...sprints];
  let tasksCopy = [...tasks];
  const archivedSprintIds: string[] = [];
  const logs: string[] = getAutoArchiveLogs();
  let movedTasksCount = 0;
  let newSprintCreated = false;

  // Process each project's sprints
  for (const project of projects) {
    const projectSprints = sprintsCopy.filter((s) => s.projectId === project.id);

    for (const sprint of projectSprints) {
      if (sprint.status === 'completed') continue;

      // Parse end date
      const endDate = new Date(sprint.endDate);
      // If end date has passed (comparing dates at midnight or timestamp)
      if (!isNaN(endDate.getTime()) && endDate < now && sprint.endDate < todayStr) {
        // Mark sprint as completed (archived)
        archivedSprintIds.push(sprint.id);
        sprintsCopy = sprintsCopy.map((s) =>
          s.id === sprint.id ? { ...s, status: 'completed' as const } : s
        );

        const archiveLog = `[Auto-Archive] Sprint "${sprint.name}" (${project.name}) expired on ${sprint.endDate} and was automatically archived.`;
        logs.unshift(`${new Date().toLocaleString()}: ${archiveLog}`);

        // Find unfinished tasks in this sprint (not 'done')
        const unfinishedTasks = tasksCopy.filter(
          (t) => t.sprintId === sprint.id && t.status !== 'done'
        );

        if (unfinishedTasks.length > 0) {
          // Find next active or planned sprint for this project
          let nextSprint = sprintsCopy.find(
            (s) => s.projectId === project.id && s.id !== sprint.id && s.status !== 'completed'
          );

          // If no active/planned sprint exists, create a new active Sprint!
          if (!nextSprint) {
            const sprintCount = projectSprints.length + 1;
            const startDateStr = todayStr;
            const endDateObj = new Date(now.getTime() + 14 * 86400000);
            const endDateStr = endDateObj.toISOString().split('T')[0];

            nextSprint = {
              id: `sprint-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: `Sprint ${sprintCount} (Rollover)`,
              projectId: project.id,
              status: 'active',
              startDate: startDateStr,
              endDate: endDateStr,
              goal: `Auto-generated sprint for unfinished tasks rolled over from ${sprint.name}`,
            };

            sprintsCopy.push(nextSprint);
            newSprintCreated = true;
            logs.unshift(
              `${new Date().toLocaleString()}: Created new active sprint "${nextSprint.name}" for project ${project.name}`
            );
          }

          // Move unfinished tasks to the target sprint
          const targetSprintId = nextSprint.id;
          tasksCopy = tasksCopy.map((t) => {
            if (t.sprintId === sprint.id && t.status !== 'done') {
              movedTasksCount++;
              return {
                ...t,
                sprintId: targetSprintId,
                updatedAt: todayStr,
              };
            }
            return t;
          });

          logs.unshift(
            `${new Date().toLocaleString()}: Moved ${unfinishedTasks.length} unfinished task(s) from "${sprint.name}" to "${nextSprint.name}"`
          );
        }
      }
    }
  }

  if (archivedSprintIds.length > 0 || movedTasksCount > 0) {
    saveAutoArchiveLogs(logs.slice(0, 100));
    // Dispatch custom event for UI updates
    window.dispatchEvent(
      new CustomEvent('sprints_auto_archived', {
        detail: {
          archivedSprintIds,
          movedTasksCount,
          newSprintCreated,
          sprints: sprintsCopy,
          tasks: tasksCopy,
        },
      })
    );
  }

  return {
    archivedSprintIds,
    movedTasksCount,
    newSprintCreated,
    updatedSprints: sprintsCopy,
    updatedTasks: tasksCopy,
    logs,
  };
}
