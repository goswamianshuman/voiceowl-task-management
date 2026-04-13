import { Request, Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority, CreateTaskBody, UpdateTaskBody } from './task.types';
import { sendError } from '../../shared/utils/response';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidStatus(value: unknown): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

function isValidPriority(value: unknown): value is TaskPriority {
  return Object.values(TaskPriority).includes(value as TaskPriority);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// ─── validateCreateTask ───────────────────────────────────────────────────────
// Collects ALL validation errors before responding — client gets the full picture
// in a single 400, not one error at a time.

export function validateCreateTask(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Partial<CreateTaskBody>;
  const errors: string[] = [];

  // title — required, string, 3–100 chars
  if (!body.title) {
    errors.push('title is required');
  } else if (typeof body.title !== 'string') {
    errors.push('title must be a string');
  } else {
    const trimmed = body.title.trim();
    if (trimmed.length < 3) errors.push('title must be at least 3 characters');
    if (trimmed.length > 100) errors.push('title must be at most 100 characters');
  }

  // status — optional, must be a valid TaskStatus value
  if (body.status !== undefined && !isValidStatus(body.status)) {
    errors.push(`status must be one of: ${Object.values(TaskStatus).join(', ')}`);
  }

  // priority — optional, must be a valid TaskPriority value
  if (body.priority !== undefined && !isValidPriority(body.priority)) {
    errors.push(`priority must be one of: ${Object.values(TaskPriority).join(', ')}`);
  }

  // dueDate — optional, must parse to a valid future date
  if (body.dueDate !== undefined) {
    const date = new Date(body.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('dueDate must be a valid date');
    } else if (date <= new Date()) {
      errors.push('dueDate must be a future date');
    }
  }

  // tags — optional, must be an array of strings
  if (body.tags !== undefined && !isStringArray(body.tags)) {
    errors.push('tags must be an array of strings');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }

  next();
}

// ─── validateUpdateTask ───────────────────────────────────────────────────────
// Same rules as POST but all fields are optional. Body must contain at least one field.

export function validateUpdateTask(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Partial<UpdateTaskBody>;
  const errors: string[] = [];

  // Body must not be empty
  if (!body || Object.keys(body).length === 0) {
    sendError(res, 'Validation failed', 400, ['Request body must contain at least one field to update']);
    return;
  }

  // title — optional, but if present apply same rules
  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      errors.push('title must be a string');
    } else {
      const trimmed = body.title.trim();
      if (trimmed.length < 3) errors.push('title must be at least 3 characters');
      if (trimmed.length > 100) errors.push('title must be at most 100 characters');
    }
  }

  if (body.status !== undefined && !isValidStatus(body.status)) {
    errors.push(`status must be one of: ${Object.values(TaskStatus).join(', ')}`);
  }

  if (body.priority !== undefined && !isValidPriority(body.priority)) {
    errors.push(`priority must be one of: ${Object.values(TaskPriority).join(', ')}`);
  }

  if (body.dueDate !== undefined) {
    const date = new Date(body.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('dueDate must be a valid date');
    } else if (date <= new Date()) {
      errors.push('dueDate must be a future date');
    }
  }

  if (body.tags !== undefined && !isStringArray(body.tags)) {
    errors.push('tags must be an array of strings');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }

  next();
}
