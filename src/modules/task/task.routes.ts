import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { validateCreateTask, validateUpdateTask } from './task.validation';
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  getTaskStatsController,
} from './task.controller';

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────
// NOTE: /stats MUST be registered before /:id. Express matches routes top-down;
// if /:id comes first, the string "stats" is captured as a task ID and this
// route is never reached.

router.get('/stats', asyncHandler(getTaskStatsController));

router.post('/', validateCreateTask, asyncHandler(createTaskController));
router.get('/', asyncHandler(getTasksController));
router.get('/:id', asyncHandler(getTaskByIdController));
router.patch('/:id', validateUpdateTask, asyncHandler(updateTaskController));
router.delete('/:id', asyncHandler(deleteTaskController));

export default router;
