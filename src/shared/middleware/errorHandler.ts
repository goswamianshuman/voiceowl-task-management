import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/response';

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered as the last app.use() in app.ts (4-argument signature
// tells Express this is an error handler, not a regular middleware).

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unexpected error — do not leak internals to the client
  sendError(res, 'An unexpected error occurred', 500);
}
