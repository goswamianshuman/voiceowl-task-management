import { Request, Response } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from './task.service';
import { CreateTaskBody, UpdateTaskBody, TaskQueryParams } from './task.types';
import { sendSuccess } from '../../shared/utils/response';

// ─── Controllers ──────────────────────────────────────────────────────────────
// Controllers are thin: read req → call service → write res.
// All are wrapped with asyncHandler in task.routes.ts — no try/catch here.

export async function createTaskController(
  req: Request<object, object, CreateTaskBody>,
  res: Response
): Promise<void> {
  const task = await createTask(req.body);
  sendSuccess(res, task as unknown as Record<string, unknown>, 201);
}

export async function getTasksController(
  req: Request<object, object, object, TaskQueryParams>,
  res: Response
): Promise<void> {
  const result = await getTasks(req.query);
  sendSuccess(
    res,
    { tasks: result.tasks },
    200,
    {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
    }
  );
}

export async function getTaskByIdController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const task = await getTaskById(req.params.id);
  sendSuccess(res, task as unknown as Record<string, unknown>);
}

export async function updateTaskController(
  req: Request<{ id: string }, object, UpdateTaskBody>,
  res: Response
): Promise<void> {
  const task = await updateTask(req.params.id, req.body);
  sendSuccess(res, task as unknown as Record<string, unknown>);
}

export async function deleteTaskController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  await deleteTask(req.params.id);
  sendSuccess(res, { message: 'Task deleted successfully' });
}

export async function getTaskStatsController(
  _req: Request,
  res: Response
): Promise<void> {
  const stats = await getTaskStats();
  sendSuccess(res, stats as unknown as Record<string, unknown>);
}
