// ─── Enums ────────────────────────────────────────────────────────────────────
// Use these values everywhere — never hardcode 'todo', 'high', etc. as raw strings.

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ─── Request Body Types ───────────────────────────────────────────────────────

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

// ─── Query Parameter Types ────────────────────────────────────────────────────

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  tags?: string;
  dueBefore?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  limit?: string;
}

// ─── Stats Response Type ──────────────────────────────────────────────────────

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
}
