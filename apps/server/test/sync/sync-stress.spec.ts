// apps/server/test/sync/sync-stress.spec.ts
import { describe, it, expect } from 'vitest';
import { ConflictResolver } from '../../src/modules/sync/conflict-resolver';
import { SyncService } from '../../src/modules/sync/sync.service';
import { SyncMutationDto } from '../../src/modules/sync/dto/sync.dto';

describe('Multi-Tenant Offline Sync & Conflict Resolution Suite', () => {
  it('should resolve additive stock updates correctly', async () => {
    const executedQueries: Array<{ sql: string; params: any[] }> = [];
    const mockQueryRunner = {
      query: async (sql: string, params: any[]) => {
        executedQueries.push({ sql, params });
        return [];
      }
    };

    const mutation: SyncMutationDto = {
      id: 'mut-001',
      entityName: 'products',
      entityId: 'prod-wheat-40kg',
      action: 'UPDATE',
      payload: { stock_delta: -5 },
      clientVersion: 1,
      clientCreatedAtUtc: new Date().toISOString()
    };

    await ConflictResolver.resolveStockMutation(mockQueryRunner, 'tenant-root-001', mutation);

    expect(executedQueries.length).toBe(1);
    expect(executedQueries[0].sql).toContain('UPDATE products SET current_stock = current_stock + $1');
    expect(executedQueries[0].params[0]).toBe(-5);
    expect(executedQueries[0].params[1]).toBe('prod-wheat-40kg');
    expect(executedQueries[0].params[2]).toBe('tenant-root-001');
  });

  it('should process batch push mutations in SyncService', async () => {
    const syncService = new SyncService();
    const result = await syncService.processPushBatch('tenant-root-001', {
      clientId: 'pos-terminal-01',
      lastSyncedCheckpointUtc: new Date(Date.now() - 3600000).toISOString(),
      changes: [
        {
          id: 'mut-101',
          entityName: 'orders',
          entityId: 'ord-901',
          action: 'INSERT',
          payload: { total_gross: 5400, net_amount: 5400 },
          clientVersion: 1,
          clientCreatedAtUtc: new Date().toISOString()
        }
      ]
    });

    expect(result.syncedIds).toContain('mut-101');
    expect(result.failed.length).toBe(0);
    expect(result.checkpointUtc).toBeDefined();
  });
});
