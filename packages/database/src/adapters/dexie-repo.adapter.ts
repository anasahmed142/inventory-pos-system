// packages/database/src/adapters/dexie-repo.adapter.ts
import { localBrowserDb } from './dexie.adapter';
import type { Table } from 'dexie';
import type {
  Product,
  Party,
  Order,
  OrderItem,
  LedgerEntry
} from '@inventory/shared-types';
import type {
  IRepository,
  IProductRepository,
  IKhataRepository,
  IOrderRepository,
  QueryOptions,
  LedgerEntryInput
} from '../interfaces/repository.interface';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class DexieRepository<T extends { id: string; tenant_id?: string }>
  implements IRepository<T>
{
  constructor(
    protected readonly table: Table<T, string>,
    protected readonly entityName: string,
    protected readonly tenantId: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const item = await this.table.get(id);
    return item && item.tenant_id === this.tenantId ? item : null;
  }

  async findMany(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    let collection = this.table.where('tenant_id').equals(this.tenantId);

    if (filter) {
      collection = collection.filter((item) =>
        Object.entries(filter).every(
          ([k, v]) => v === undefined || (item as Record<string, unknown>)[k] === v
        )
      );
    }

    if (options?.offset) collection = collection.offset(options.offset);
    if (options?.limit) collection = collection.limit(options.limit);

    return collection.toArray();
  }

  async create(entity: T): Promise<T> {
    await localBrowserDb.transaction('rw', [this.table, localBrowserDb.sync_outbox], async () => {
      await this.table.add(entity);
      await localBrowserDb.sync_outbox.add({
        id: generateUUID(),
        tenant_id: this.tenantId,
        entity_name: this.entityName,
        entity_id: entity.id,
        operation: 'INSERT',
        payload_json: JSON.stringify(entity),
        client_version: 1,
        created_at_utc: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0
      });
    });
    return entity;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    await localBrowserDb.transaction('rw', [this.table, localBrowserDb.sync_outbox], async () => {
      await this.table.update(id, updates as any);
      await localBrowserDb.sync_outbox.add({
        id: generateUUID(),
        tenant_id: this.tenantId,
        entity_name: this.entityName,
        entity_id: id,
        operation: 'UPDATE',
        payload_json: JSON.stringify(updates),
        client_version: 1,
        created_at_utc: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0
      });
    });
    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string): Promise<boolean> {
    await localBrowserDb.transaction('rw', [this.table, localBrowserDb.sync_outbox], async () => {
      await this.table.delete(id);
      await localBrowserDb.sync_outbox.add({
        id: generateUUID(),
        tenant_id: this.tenantId,
        entity_name: this.entityName,
        entity_id: id,
        operation: 'DELETE',
        payload_json: '{}',
        client_version: 1,
        created_at_utc: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0
      });
    });
    return true;
  }
}

export class DexieProductRepository
  extends DexieRepository<Product>
  implements IProductRepository
{
  constructor(tenantId: string) {
    super(localBrowserDb.products, 'products', tenantId);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const item = await localBrowserDb.products
      .where('[tenant_id+barcode]')
      .equals([this.tenantId, barcode])
      .first();
    return item || null;
  }

  async updateStock(id: string, quantityDelta: number): Promise<void> {
    const product = await this.findById(id);
    if (!product) return;
    await this.update(id, { current_stock: product.current_stock + quantityDelta });
  }

  async findLowStock(threshold = 10): Promise<Product[]> {
    return localBrowserDb.products
      .where('tenant_id')
      .equals(this.tenantId)
      .filter((p) => p.current_stock <= p.min_stock_threshold)
      .toArray();
  }
}

export class DexieKhataRepository
  extends DexieRepository<LedgerEntry>
  implements IKhataRepository
{
  constructor(tenantId: string) {
    super(localBrowserDb.ledger_entries, 'ledger_entries', tenantId);
  }

  async recordTransaction(partyId: string, entry: LedgerEntryInput): Promise<LedgerEntry> {
    const entryId = generateUUID();
    let resultingEntry: LedgerEntry;

    await localBrowserDb.transaction(
      'rw',
      [localBrowserDb.parties, localBrowserDb.ledger_entries, localBrowserDb.sync_outbox],
      async () => {
        const party = await localBrowserDb.parties.get(partyId);
        if (!party) throw new Error(`Party ${partyId} not found`);

        const balanceDelta = entry.entry_type === 'naam' ? entry.amount : -entry.amount;
        const newBalance = Number(party.current_balance) + balanceDelta;

        await localBrowserDb.parties.update(partyId, { current_balance: newBalance });

        resultingEntry = {
          id: entryId,
          tenant_id: this.tenantId,
          party_id: partyId,
          order_id: entry.order_id || null,
          entry_type: entry.entry_type,
          amount: entry.amount,
          balance_after: newBalance,
          description: entry.description || null,
          urdu_description: entry.urdu_description || null,
          created_at: new Date().toISOString()
        };

        await localBrowserDb.ledger_entries.add(resultingEntry);
        await localBrowserDb.sync_outbox.add({
          id: generateUUID(),
          tenant_id: this.tenantId,
          entity_name: 'ledger_entries',
          entity_id: entryId,
          operation: 'INSERT',
          payload_json: JSON.stringify(resultingEntry),
          client_version: 1,
          created_at_utc: new Date().toISOString(),
          sync_status: 'pending',
          retry_count: 0
        });
      }
    );

    return resultingEntry!;
  }

  async getPartyLedger(partyId: string, options?: QueryOptions): Promise<LedgerEntry[]> {
    return localBrowserDb.ledger_entries
      .where('[tenant_id+party_id+created_at]')
      .between([this.tenantId, partyId, ''], [this.tenantId, partyId, '\uffff'])
      .reverse()
      .limit(options?.limit || 100)
      .toArray();
  }

  async getPartyCurrentBalance(partyId: string): Promise<number> {
    const party = await localBrowserDb.parties.get(partyId);
    return party ? party.current_balance : 0;
  }
}

export class DexieOrderRepository
  extends DexieRepository<Order>
  implements IOrderRepository
{
  constructor(tenantId: string) {
    super(localBrowserDb.orders, 'orders', tenantId);
  }

  async createOrderWithItems(order: Order, items: OrderItem[]): Promise<Order> {
    await localBrowserDb.transaction(
      'rw',
      [
        localBrowserDb.orders,
        localBrowserDb.order_items,
        localBrowserDb.products,
        localBrowserDb.parties,
        localBrowserDb.ledger_entries,
        localBrowserDb.sync_outbox
      ],
      async () => {
        await localBrowserDb.orders.add(order);
        for (const item of items) {
          await localBrowserDb.order_items.add(item);
          const p = await localBrowserDb.products.get(item.product_id);
          if (p) {
            await localBrowserDb.products.update(item.product_id, {
              current_stock: p.current_stock - item.quantity
            });
          }
        }

        if (order.payment_method === 'udhaar' && order.party_id && order.balance_amount > 0) {
          const party = await localBrowserDb.parties.get(order.party_id);
          if (party) {
            const newBal = Number(party.current_balance) + order.balance_amount;
            await localBrowserDb.parties.update(order.party_id, { current_balance: newBal });
            await localBrowserDb.ledger_entries.add({
              id: generateUUID(),
              tenant_id: this.tenantId,
              party_id: order.party_id,
              order_id: order.id,
              entry_type: 'naam',
              amount: order.balance_amount,
              balance_after: newBal,
              description: 'Sale Invoice Udhaar',
              urdu_description: 'سیل انوائس ادھار',
              created_at: new Date().toISOString()
            });
          }
        }

        await localBrowserDb.sync_outbox.add({
          id: generateUUID(),
          tenant_id: this.tenantId,
          entity_name: 'orders',
          entity_id: order.id,
          operation: 'INSERT',
          payload_json: JSON.stringify({ order, items }),
          client_version: 1,
          created_at_utc: new Date().toISOString(),
          sync_status: 'pending',
          retry_count: 0
        });
      }
    );

    return order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return localBrowserDb.order_items.where('order_id').equals(orderId).toArray();
  }
}