// packages/database/src/backup/backup-service.ts
import Database from '@tauri-apps/plugin-sql';

export interface BackupMetadata {
  filename: string;
  timestampUtc: string;
  sizeBytes: number;
  checksum: string;
  schemaVersion: number;
}

export class BackupService {
  public static async enforcePowerFailureResilience(db: Database): Promise<void> {
    await db.execute('PRAGMA journal_mode = WAL;');
    await db.execute('PRAGMA synchronous = NORMAL;');
    await db.execute('PRAGMA temp_store = MEMORY;');
    await db.execute('PRAGMA foreign_keys = ON;');
  }

  public static async createSnapshot(destinationDir = 'backups'): Promise<BackupMetadata> {
    const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isDesktop) {
      throw new Error('SQLite snapshots are only supported on Desktop target.');
    }

    const { invoke } = await import('@tauri-apps/api/core');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auto_snapshot_${timestamp}.bak`;

    const result: { sizeBytes: number; checksum: string } = await invoke('create_sqlite_backup', {
      targetPath: `${destinationDir}/${filename}`
    });

    return {
      filename,
      timestampUtc: new Date().toISOString(),
      sizeBytes: result.sizeBytes,
      checksum: result.checksum,
      schemaVersion: 1
    };
  }
}