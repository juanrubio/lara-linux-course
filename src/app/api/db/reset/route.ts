import { NextResponse } from 'next/server';
import { sqlite } from '@/lib/db';

function isResetAllowed() {
  return process.env.ALLOW_DB_RESET === 'true' || process.env.NODE_ENV !== 'production';
}

function escapeIdentifier(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

export async function POST() {
  if (!isResetAllowed()) {
    return NextResponse.json({ error: 'Database reset disabled' }, { status: 403 });
  }

  try {
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as Array<{ name: string }>;

    sqlite.pragma('foreign_keys = OFF');

    const resetTx = sqlite.transaction(() => {
      for (const { name } of tables) {
        sqlite.exec(`DELETE FROM ${escapeIdentifier(name)}`);
      }
      try {
        sqlite.exec('DELETE FROM sqlite_sequence');
      } catch {
        // sqlite_sequence may not exist if no AUTOINCREMENT tables exist.
      }
    });

    resetTx();
    sqlite.pragma('foreign_keys = ON');

    return NextResponse.json({ ok: true, tablesCleared: tables.length });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
