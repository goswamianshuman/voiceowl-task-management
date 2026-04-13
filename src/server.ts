import mongoose from 'mongoose';
import app from './app';
import { MONGO_URI, PORT } from './config/env';

// ─── Bootstrap ────────────────────────────────────────────────────────────────
// Connect to MongoDB first, then start the HTTP server.
// A server that starts without a DB connection is a broken server.
  
async function bootstrap(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`[SERVER] Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[FATAL] Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

bootstrap();
