// apps/server/src/modules/sync/conflict-resolver.ts
import { SyncMutationDto } from './dto/sync.dto';

export class ConflictResolver {
  public static async resolveStockMutation(queryRunner: any, tenantId: string, mutation: SyncMutationDto): Promise<void> {
    const { entityId, payload, action } = mutation;
    if (action === 'UPDATE' && payload?.stock_delta !== undefined) {
      await queryRunner.query(
        `UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3`,
        [payload.stock_delta, entityId, tenantId]
      );
    }
  }

  public static async resolveKhataMutation(queryRunner: any, tenantId: string, mutation: SyncMutationDto): Promise<void> {
    const { entityId, payload } = mutation;
    await queryRunner.query(
      `INSERT INTO ledger_entries (id, tenant_id, party_id, order_id, entry_type, amount, balance_after, description, urdu_description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
      [entityId, tenantId, payload.party_id, payload.order_id || null, payload.entry_type, payload.amount, payload.balance_after || 0, payload.description || null, payload.urdu_description || null, mutation.clientCreatedAtUtc]
    );
    await queryRunner.query(
      `UPDATE parties SET current_balance = (
         SELECT COALESCE(SUM(CASE WHEN entry_type = 'naam' THEN amount ELSE -amount END), 0)
         FROM ledger_entries WHERE party_id = $1 AND tenant_id = $2
       ), updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`,
      [payload.party_id, tenantId]
    );
  }
}