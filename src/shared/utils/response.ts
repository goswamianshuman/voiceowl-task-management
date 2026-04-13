import { Response } from 'express';

// ─── Response Shapes ──────────────────────────────────────────────────────────

interface SuccessPayload {
  [key: string]: unknown;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── sendSuccess ──────────────────────────────────────────────────────────────
// Sends a consistent success envelope. All controllers call this — never res.json() directly.

export function sendSuccess(
  res: Response,
  data: SuccessPayload | SuccessPayload[],
  statusCode = 200,
  pagination?: PaginationMeta
): void {
  const body: Record<string, unknown> = { success: true, data };
  if (pagination) {
    body['pagination'] = pagination;
  }
  res.status(statusCode).json(body);
}

// ─── sendError ────────────────────────────────────────────────────────────────
// Sends a consistent error envelope. Called by errorHandler and controllers for 404s.

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: string[]
): void {
  const body: Record<string, unknown> = { success: false, message };
  if (errors && errors.length > 0) {
    body['errors'] = errors;
  }
  res.status(statusCode).json(body);
}
