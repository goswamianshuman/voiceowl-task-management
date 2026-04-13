import mongoose from 'mongoose';
import { Task, ITask } from './task.model';
import { CreateTaskBody, UpdateTaskBody, TaskQueryParams, TaskStats, TaskStatus, TaskPriority } from './task.types';
import { AppError } from '../../shared/errors/AppError';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginatedTasks {
  tasks: ITask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── validateObjectId ─────────────────────────────────────────────────────────
// Call before any query that uses an ID. Throws 400 immediately on invalid format.

export function validateObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid task ID: ${id}`, 400);
  }
}

// ─── createTask ───────────────────────────────────────────────────────────────

export async function createTask(body: CreateTaskBody): Promise<ITask> {
  const task = await Task.create({
    title: body.title.trim(),
    description: body.description?.trim(),
    status: body.status,
    priority: body.priority,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    tags: body.tags ?? [],
  });

  // Return lean object — hydrated Mongoose documents are never returned to callers
  return (await Task.findById(task._id).lean<ITask>().exec()) as ITask;
}

// ─── getTasks ─────────────────────────────────────────────────────────────────
// Builds the filter dynamically — only adds conditions for params that were provided.

export async function getTasks(params: TaskQueryParams): Promise<PaginatedTasks> {
  const filter: mongoose.FilterQuery<ITask> = {};

  if (params.status) filter['status'] = params.status;
  if (params.priority) filter['priority'] = params.priority;
  if (params.tags) filter['tags'] = { $in: params.tags.split(',').map((t) => t.trim()) };
  if (params.dueBefore) filter['dueDate'] = { $lte: new Date(params.dueBefore) };

  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? '10', 10)));
  const skip = (page - 1) * limit;

  const sortField = params.sortBy ?? 'createdAt';
  const sortOrder = params.order === 'asc' ? 1 : -1;

  // NOTE: Promise.all() — total count and data are independent queries; running
  // them in parallel halves the DB round-trip time vs sequential awaits.
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean<ITask[]>()
      .exec(),
    Task.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    tasks,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── getTaskById ──────────────────────────────────────────────────────────────

export async function getTaskById(id: string): Promise<ITask> {
  validateObjectId(id);

  const task = await Task.findById(id).lean<ITask>().exec();
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
}

// ─── updateTask ───────────────────────────────────────────────────────────────
// Uses dot-notation keys in $set to avoid wiping unspecified sub-fields.

export async function updateTask(id: string, body: UpdateTaskBody): Promise<ITask> {
  validateObjectId(id);

  // Build update object dynamically — only include fields that were provided
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData['title'] = body.title.trim();
  if (body.description !== undefined) updateData['description'] = body.description.trim();
  if (body.status !== undefined) updateData['status'] = body.status;
  if (body.priority !== undefined) updateData['priority'] = body.priority;
  if (body.dueDate !== undefined) updateData['dueDate'] = new Date(body.dueDate);
  if (body.tags !== undefined) updateData['tags'] = body.tags;

  const task = await Task.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true } // new: return updated doc; runValidators: enforce schema rules
  )
    .lean<ITask>()
    .exec();

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
}

// ─── deleteTask ───────────────────────────────────────────────────────────────

export async function deleteTask(id: string): Promise<void> {
  validateObjectId(id);

  const result = await Task.findByIdAndDelete(id).lean<ITask>().exec();
  if (!result) {
    throw new AppError('Task not found', 404);
  }
}

// ─── getTaskStats ─────────────────────────────────────────────────────────────
// Single aggregation pipeline — returns all stats in one DB call instead of
// running four separate count queries.

export async function getTaskStats(): Promise<TaskStats> {
  const now = new Date();

  const [statusAgg, priorityAgg, overdueCount, total] = await Promise.all([
    Task.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      dueDate: { $lt: now },
      status: { $ne: TaskStatus.DONE },
    }).exec(),
    Task.countDocuments().exec(),
  ]);

  const byStatus: Record<string, number> = {};
  for (const s of Object.values(TaskStatus)) byStatus[s] = 0;
  for (const row of statusAgg) byStatus[row._id] = row.count;

  const byPriority: Record<string, number> = {};
  for (const p of Object.values(TaskPriority)) byPriority[p] = 0;
  for (const row of priorityAgg) byPriority[row._id] = row.count;

  return { total, byStatus, byPriority, overdue: overdueCount };
}
