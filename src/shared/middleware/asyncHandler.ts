import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// ─── asyncHandler ─────────────────────────────────────────────────────────────
// Wraps an async route handler and forwards any thrown error to next(error).
// This eliminates try/catch blocks in every controller — errors propagate
// automatically to the global error handler registered in app.ts.
// Generic parameters mirror Express's Request generics so typed controllers work.

export function asyncHandler<
  P extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next): void => {
    fn(req, res, next).catch(next);
  };
}
