import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description:
        'A production-quality Task Manager REST API built with Node.js, TypeScript, Express, and MongoDB.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            title: { type: 'string', example: 'Fix login bug' },
            description: { type: 'string', example: 'Users cannot log in with Google OAuth', nullable: true },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'done'],
              example: 'todo',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2027-12-31T00:00:00.000Z',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['backend', 'auth'],
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-06-04T12:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-04T12:00:00.000Z' },
          },
        },
        CreateTaskBody: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 100, example: 'Fix login bug' },
            description: { type: 'string', example: 'Users cannot log in with Google OAuth' },
            status: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'todo' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            dueDate: { type: 'string', format: 'date', example: '2027-12-31' },
            tags: { type: 'array', items: { type: 'string' }, example: ['backend', 'auth'] },
          },
        },
        UpdateTaskBody: {
          type: 'object',
          minProperties: 1,
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 100, example: 'Updated title' },
            description: { type: 'string', example: 'Updated description' },
            status: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'in-progress' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
            dueDate: { type: 'string', format: 'date', example: '2027-12-31' },
            tags: { type: 'array', items: { type: 'string' }, example: ['frontend'] },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 42 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 5 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
        StatsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 42 },
                byStatus: {
                  type: 'object',
                  properties: {
                    todo: { type: 'integer', example: 18 },
                    'in-progress': { type: 'integer', example: 12 },
                    done: { type: 'integer', example: 12 },
                  },
                },
                byPriority: {
                  type: 'object',
                  properties: {
                    low: { type: 'integer', example: 10 },
                    medium: { type: 'integer', example: 22 },
                    high: { type: 'integer', example: 10 },
                  },
                },
                overdue: { type: 'integer', example: 5 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['title must be at least 3 characters'],
            },
          },
        },
      },
    },
    tags: [
      { name: 'Tasks', description: 'Task management endpoints' },
      { name: 'Health', description: 'Server health check' },
    ],
    paths: {
      '/api/tasks': {
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTaskBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Task' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
        get: {
          tags: ['Tasks'],
          summary: 'Get all tasks with optional filters and pagination',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } },
            { name: 'tags', in: 'query', description: 'Comma-separated tag values', schema: { type: 'string', example: 'backend,auth' } },
            { name: 'dueBefore', in: 'query', schema: { type: 'string', format: 'date', example: '2027-12-31' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'createdAt' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: {
              description: 'Paginated list of tasks',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
              },
            },
          },
        },
      },
      '/api/tasks/stats': {
        get: {
          tags: ['Tasks'],
          summary: 'Get aggregate task statistics',
          description: 'Returns total count, count by status, count by priority, and number of overdue tasks.',
          responses: {
            200: {
              description: 'Task statistics',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } },
              },
            },
          },
        },
      },
      '/api/tasks/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' } },
        ],
        get: {
          tags: ['Tasks'],
          summary: 'Get a single task by ID',
          responses: {
            200: {
              description: 'Task found',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { properties: { data: { $ref: '#/components/schemas/Task' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Invalid ID format', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Update one or more fields of a task',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskBody' } },
            },
          },
          responses: {
            200: {
              description: 'Task updated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { properties: { data: { $ref: '#/components/schemas/Task' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error or invalid ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task by ID',
          responses: {
            200: {
              description: 'Task deleted',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { properties: { data: { type: 'object', properties: { message: { type: 'string', example: 'Task deleted successfully' } } } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Invalid ID format', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: { description: 'Server is running', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
