import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file path - stored in data directory
const dbPath = path.join(process.cwd(), 'data', 'codequest.db');

// Create database connection
export const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema });

// Export schema for use elsewhere
export * from './schema';
