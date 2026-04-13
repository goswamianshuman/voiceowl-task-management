import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import taskRoutes from './modules/task/task.routes';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/tasks', taskRoutes);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
// Available at http://localhost:3000/api-docs

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose raw OpenAPI JSON for external tooling
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered last — Express identifies 4-argument middleware as error handlers.

app.use(errorHandler);

export default app;
