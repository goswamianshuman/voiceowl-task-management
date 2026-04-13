import mongoose, { Document, Schema } from 'mongoose';
import { TaskStatus, TaskPriority } from './task.types';

// ─── ITask Interface ──────────────────────────────────────────────────────────

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,  // auto-manages createdAt and updatedAt
    versionKey: false, // removes __v from all responses
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Index on status — the most common filter; avoids full collection scans on list queries.
taskSchema.index({ status: 1 });

// Index on priority — frequently combined with status filter in compound queries.
taskSchema.index({ priority: 1 });

// Index on dueDate — used for sorting and dueBefore filter; enables range scans.
taskSchema.index({ dueDate: 1 });

// Compound index on status + priority — covers the most common multi-filter query.
taskSchema.index({ status: 1, priority: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

export const Task = mongoose.model<ITask>('Task', taskSchema);
