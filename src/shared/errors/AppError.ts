// ─── AppError ────────────────────────────────────────────────────────────────
// Custom error class that carries an HTTP statusCode.
// Throw this anywhere in service or controller layers — the global error
// handler reads statusCode so you never set status codes in catch blocks.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs

    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
