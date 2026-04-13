import dotenv from 'dotenv';

dotenv.config();

// ─── Validate Required Variables ────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const MONGO_URI = requireEnv('MONGO_URI');
export const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
export const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
