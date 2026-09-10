// packages/database/src/sync/sync-coordinator.ts
import type { SyncOutboxItem } from '@inventory/shared-types';
import { SqliteSyncOutboxRepository, TauriSqliteDatabase } from '../adapters/sqlite.adapter';
import { localBrowserDb } from '../adapters/dexie.adapter';

export interface SyncConfig {
  apiUrl: string;
  tenantId: string;
  authTokenGetter: () => string | null;
  pollIntervalMs?: number;
}

export class OfflineSyncCoordinator {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing = false;
  private timer: any = null;
  private lastSyncedUtc: string = new Date(0).toISOString();

  constructor(private readonly config: SyncConfig) {
    this.initNetworkListeners();
  }

  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    const interval = this.config.pollIntervalMs || 30000;
    this.timer = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.triggerSync();
      }
    }, interval);
  }

  public destroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  public async triggerSync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;
    this.isSyncing = true;
    try {
      await this.triggerSyncPush();
      await this.triggerSyncPull();
    } catch (err) {
      console.error('[OfflineSyncCoordinator] Sync cycle error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  public async triggerSyncPush(): Promise<void> {
    const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    let pendingItems: SyncOutboxItem[] = [];

    if (isDesktop) {
      const outboxRepo = new SqliteSyncOutboxRepository(this.config.tenantId);
      pendingItems = await outboxRepo.getPendingBatch(50);
    } else {
      pendingItems = await localBrowserDb.sync_outbox
        .where('tenant_id')
        .equals(this.config.tenantId)
        .filter((item) => item.sync_status === 'pending')
        .limit(50)
        .toArray();
    }

    if (pendingItems.length === 0) return;

    const token = this.config.authTokenGetter();
    const response = await fetch(`${this.config.apiUrl}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.config.tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ mutations: pendingItems })
    });

    if (!response.ok) {
      throw new Error(`Push sync failed: ${response.statusText}`);
    }

    const { acknowledgedIds }: { acknowledgedIds: string[] } = await response.json();

    if (isDesktop) {
      const outboxRepo = new SqliteSyncOutboxRepository(this.config.tenantId);
      await outboxRepo.markSynced(acknowledgedIds);
    } else {
      await localBrowserDb.sync_outbox
        .where('id')
        .anyOf(acknowledgedIds)
        .modify({ sync_status: 'synced' });
    }
  }

  public async triggerSyncPull(): Promise<void> {
    const token = this.config.authTokenGetter();
    const params = new URLSearchParams({
      since: this.lastSyncedUtc,
      tenantId: this.config.tenantId
    });

    const response = await fetch(`${this.config.apiUrl}/sync/pull?${params.toString()}`, {
      headers: {
        'X-Tenant-ID': this.config.tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Pull sync failed: ${response.statusText}`);
    }

    const {
      changes,
      checkpointUtc
    }: {
      changes: Array<{ entity: string; data: Record<string, unknown> }>;
      checkpointUtc: string;
    } = await response.json();

    const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    if (isDesktop) {
      const db = await TauriSqliteDatabase.getInstance();
      await db.execute('BEGIN TRANSACTION');
      try {
        for (const change of changes) {
          const keys = Object.keys(change.data);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(change.data);
          await db.execute(
            `INSERT OR REPLACE INTO ${change.entity} (${keys.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
        await db.execute('COMMIT');
      } catch (e) {
        await db.execute('ROLLBACK');
        throw e;
      }
    } else {
      await localBrowserDb.transaction('rw', localBrowserDb.tables, async () => {
        for (const change of changes) {
          const table = localBrowserDb.table(change.entity);
          if (table) {
            await table.put(change.data);
          }
        }
      });
    }

    this.lastSyncedUtc = checkpointUtc;
  }
}