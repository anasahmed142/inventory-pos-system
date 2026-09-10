// packages/database/src/adapters/sqlite.adapter.ts
import Database from '@tauri-apps/plugin-sql';
import type {
  Product,
  Party,
  Order,
  OrderItem,
  LedgerEntry,
  SyncOutboxItem
} from '@inventory/shared-types';
import type {
  IRepository,
  IProductRepository,
  IKhataRepository,
  IOrderRepository,
  ISyncOutboxRepository,
  QueryOptions,
  LedgerEntryInput
} from '../interfaces/repository.interface';

export class TauriSqliteDatabase {
  private static instance: Database | null = null;

  public static async getInstance(): Promise<Database> {
    if (!TauriSqliteDatabase.instance) {
      TauriSqliteDatabase.instance = await Database.load('sqlite:inventory.db');
    }
    return TauriSqliteDatabase.instance;
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class BaseSqliteRepository<T extends { id: string; tenant_id?: string }>
  implements IRepository<T>
{
  constructor(
    protected readonly tableName: string,
    protected readonly tenantId: string
  ) {}

  protected async getDb(): Promise<Database> {
    return TauriSqliteDatabase.getInstance();
  }

  async findById(id: string): Promise<T | null> {
    const db = await this.getDb();
    const rows = await db.select<T[]>(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, this.tenantId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async findMany(filter: Partial<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    const db = await this.getDb();
    const clauses: string[] = [`tenant_id = '${this.tenantId}'`];
    const values: unknown[] = [];

    let paramIdx = 1;
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && key !== 'tenant_id') {
        clauses.push(`${key} = $${paramIdx}`);
        values.push(value);
        paramIdx++;
      }
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = options.sortBy
      ? `ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`
      : '';
    const limit = options.limit ? `LIMIT ${options.limit}` : '';
    const offset = options.offset ? `OFFSET ${options.offset}` : '';

    return db.select<T[]>(
      `SELECT * FROM ${this.tableName} ${where} ${orderBy} ${limit} ${offset}`.trim(),
      values
    );
  }

  async create(entity: T): Promise<T> {
    const db = await this.getDb();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const outboxId = generateUUID();
    const outboxPayload = JSON.stringify(entity);

    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute(
        `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );

      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, client_version, sync_status)
         VALUES ($1, $2, $3, $4, 'INSERT', $5, 1, 'pending')`,
        [outboxId, this.tenantId, this.tableName, entity.id, outboxPayload]
      );

      await db.execute('COMMIT');
      return entity;
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const db = await this.getDb();
    const keys = Object.keys(updates).filter((k) => k !== 'id');
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map((k) => (updates as Record<string, unknown>)[k]);

    const outboxId = generateUUID();
    const outboxPayload = JSON.stringify({ id, ...updates });

    await db.execute('BEGIN TRANSACTION');
    try {
      values.push(id, this.tenantId);
      await db.execute(
        `UPDATE ${this.tableName} SET ${setClauses}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${values.length - 1} AND tenant_id = $${values.length}`,
        values
      );

      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, client_version, sync_status)
         VALUES ($1, $2, $3, $4, 'UPDATE', $5, 1, 'pending')`,
        [outboxId, this.tenantId, this.tableName, id, outboxPayload]
      );

      await db.execute('COMMIT');
      const updated = await this.findById(id);
      if (!updated) throw new Error(`Entity ${id} not found after update`);
      return updated;
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.getDb();
    const outboxId = generateUUID();

    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute(
        `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
        [id, this.tenantId]
      );

      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, client_version, sync_status)
         VALUES ($1, $2, $3, $4, 'DELETE', '{}', 1, 'pending')`,
        [outboxId, this.tenantId, this.tableName, id]
      );

      await db.execute('COMMIT');
      return true;
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }
}

export class SqliteProductRepository
  extends BaseSqliteRepository<Product>
  implements IProductRepository
{
  constructor(tenantId: string) {
    super('products', tenantId);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const db = await this.getDb();
    const rows = await db.select<Product[]>(
      `SELECT * FROM products WHERE barcode = $1 AND tenant_id = $2 LIMIT 1`,
      [barcode, this.tenantId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async updateStock(id: string, quantityDelta: number): Promise<void> {
    const db = await this.getDb();
    const outboxId = generateUUID();
    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute(
        `UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND tenant_id = $3`,
        [quantityDelta, id, this.tenantId]
      );
      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, sync_status)
         VALUES ($1, $2, 'products', $3, 'UPDATE', $4, 'pending')`,
        [outboxId, this.tenantId, id, JSON.stringify({ stock_delta: quantityDelta })]
      );
      await db.execute('COMMIT');
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }

  async findLowStock(threshold = 10): Promise<Product[]> {
    const db = await this.getDb();
    return db.select<Product[]>(
      `SELECT * FROM products WHERE tenant_id = $1 AND current_stock <= min_stock_threshold ORDER BY current_stock ASC`,
      [this.tenantId]
    );
  }
}

export class SqliteKhataRepository
  extends BaseSqliteRepository<LedgerEntry>
  implements IKhataRepository
{
  constructor(tenantId: string) {
    super('ledger_entries', tenantId);
  }

  async recordTransaction(partyId: string, entry: LedgerEntryInput): Promise<LedgerEntry> {
    const db = await this.getDb();
    const entryId = generateUUID();
    const outboxId = generateUUID();

    await db.execute('BEGIN TRANSACTION');
    try {
      const parties = await db.select<Party[]>(
        `SELECT * FROM parties WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [partyId, this.tenantId]
      );
      if (parties.length === 0) throw new Error(`Party ${partyId} not found`);

      const currentBalance = Number(parties[0].current_balance);
      const balanceDelta = entry.entry_type === 'naam' ? entry.amount : -entry.amount;
      const newBalance = currentBalance + balanceDelta;

      await db.execute(
        `UPDATE parties SET current_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3`,
        [newBalance, partyId, this.tenantId]
      );

      await db.execute(
        `INSERT INTO ledger_entries (id, tenant_id, party_id, order_id, entry_type, amount, balance_after, description, urdu_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          entryId,
          this.tenantId,
          partyId,
          entry.order_id || null,
          entry.entry_type,
          entry.amount,
          newBalance,
          entry.description || null,
          entry.urdu_description || null
        ]
      );

      const payload = JSON.stringify({
        id: entryId,
        new_balance: newBalance,
        ...entry
      });
      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, sync_status)
         VALUES ($1, $2, 'ledger_entries', $3, 'INSERT', $4, 'pending')`,
        [outboxId, this.tenantId, entryId, payload]
      );

      await db.execute('COMMIT');
      const saved = await this.findById(entryId);
      return saved!;
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }

  async getPartyLedger(partyId: string, options: QueryOptions = {}): Promise<LedgerEntry[]> {
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const db = await this.getDb();
    return db.select<LedgerEntry[]>(
      `SELECT * FROM ledger_entries WHERE party_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [partyId, this.tenantId, limit, offset]
    );
  }

  async getPartyCurrentBalance(partyId: string): Promise<number> {
    const db = await this.getDb();
    const rows = await db.select<{ current_balance: number }[]>(
      `SELECT current_balance FROM parties WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [partyId, this.tenantId]
    );
    return rows.length > 0 ? Number(rows[0].current_balance) : 0;
  }
}

export class SqliteOrderRepository
  extends BaseSqliteRepository<Order>
  implements IOrderRepository
{
  constructor(tenantId: string) {
    super('orders', tenantId);
  }

  async createOrderWithItems(order: Order, items: OrderItem[]): Promise<Order> {
    const db = await this.getDb();
    const outboxId = generateUUID();

    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute(
        `INSERT INTO orders (id, tenant_id, invoice_no, party_id, order_type, total_gross, tare_deduction, total_discount, net_amount, paid_amount, balance_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          order.id,
          this.tenantId,
          order.invoice_no,
          order.party_id || null,
          order.order_type,
          order.total_gross,
          order.tare_deduction,
          order.total_discount,
          order.net_amount,
          order.paid_amount,
          order.balance_amount,
          order.payment_method,
          order.status
        ]
      );

      for (const item of items) {
        await db.execute(
          `INSERT INTO order_items (id, order_id, product_id, batch_id, quantity, unit_id, unit_rate, bardana_tare_deducted, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            item.id,
            order.id,
            item.product_id,
            item.batch_id || null,
            item.quantity,
            item.unit_id,
            item.unit_rate,
            item.bardana_tare_deducted,
            item.line_total
          ]
        );

        await db.execute(
          `UPDATE products SET current_stock = current_stock - $1 WHERE id = $2 AND tenant_id = $3`,
          [item.quantity, item.product_id, this.tenantId]
        );
      }

      if (order.payment_method === 'udhaar' && order.party_id && order.balance_amount > 0) {
        await db.execute(
          `UPDATE parties SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3`,
          [order.balance_amount, order.party_id, this.tenantId]
        );
        const ledgerId = generateUUID();
        await db.execute(
          `INSERT INTO ledger_entries (id, tenant_id, party_id, order_id, entry_type, amount, balance_after, description, urdu_description)
           SELECT $1, $2, $3, $4, 'naam', $5, current_balance, 'Sale Invoice Udhaar', 'سیل انوائس ادھار' 
           FROM parties WHERE id = $3`,
          [ledgerId, this.tenantId, order.party_id, order.id, order.balance_amount]
        );
      }

      const payload = JSON.stringify({ order, items });
      await db.execute(
        `INSERT INTO sync_outbox (id, tenant_id, entity_name, entity_id, operation, payload_json, sync_status)
         VALUES ($1, $2, 'orders', $3, 'INSERT', $4, 'pending')`,
        [outboxId, this.tenantId, order.id, payload]
      );

      await db.execute('COMMIT');
      return order;
    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const db = await this.getDb();
    return db.select<OrderItem[]>(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId]
    );
  }
}

export class SqliteSyncOutboxRepository
  extends BaseSqliteRepository<SyncOutboxItem>
  implements ISyncOutboxRepository
{
  constructor(tenantId: string) {
    super('sync_outbox', tenantId);
  }

  async getPendingBatch(batchSize = 50): Promise<SyncOutboxItem[]> {
    const db = await this.getDb();
    return db.select<SyncOutboxItem[]>(
      `SELECT * FROM sync_outbox WHERE tenant_id = $1 AND sync_status = 'pending' ORDER BY created_at_utc ASC LIMIT $2`,
      [this.tenantId, batchSize]
    );
  }

  async markSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.getDb();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    await db.execute(
      `UPDATE sync_outbox SET sync_status = 'synced' WHERE id IN (${placeholders})`,
      ids
    );
  }

  async markFailed(id: string, error: string): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      `UPDATE sync_outbox SET sync_status = 'failed', retry_count = retry_count + 1, last_error = $1 WHERE id = $2`,
      [error, id]
    );
  }
}