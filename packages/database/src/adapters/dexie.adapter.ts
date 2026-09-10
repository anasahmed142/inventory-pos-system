// packages/database/src/adapters/dexie.adapter.ts
import Dexie, { Table } from 'dexie';
import type {
  Tenant,
  User,
  Category,
  Unit,
  Product,
  BatchLot,
  Party,
  Order,
  OrderItem,
  LedgerEntry,
  SyncOutboxItem
} from '@inventory/shared-types';

export class InventoryDexieDatabase extends Dexie {
  tenants!: Table<Tenant, string>;
  users!: Table<User, string>;
  categories!: Table<Category, string>;
  units!: Table<Unit, string>;
  products!: Table<Product, string>;
  batches_lots!: Table<BatchLot, string>;
  parties!: Table<Party, string>;
  orders!: Table<Order, string>;
  order_items!: Table<OrderItem, string>;
  ledger_entries!: Table<LedgerEntry, string>;
  sync_outbox!: Table<SyncOutboxItem, string>;

  constructor() {
    super('InventorySystem_WebDB');

    this.version(1).stores({
      tenants: '&id, name, created_at',
      users: '&id, tenant_id, [tenant_id+username], role, is_active',
      categories: '&id, tenant_id, name',
      units: '&id, tenant_id, symbol, [tenant_id+symbol]',
      products: '&id, tenant_id, category_id, barcode, name, default_unit_id, current_stock, is_seed_or_chem, [tenant_id+barcode], [tenant_id+name]',
      batches_lots: '&id, tenant_id, product_id, lot_number, expiry_date, [tenant_id+product_id]',
      parties: '&id, tenant_id, party_type, name, phone, cnic, current_balance, [tenant_id+party_type], [tenant_id+phone]',
      orders: '&id, tenant_id, invoice_no, party_id, order_type, payment_method, status, created_at, [tenant_id+invoice_no], [tenant_id+created_at]',
      order_items: '&id, order_id, product_id, batch_id, unit_id',
      ledger_entries: '&id, tenant_id, party_id, order_id, entry_type, created_at, [tenant_id+party_id+created_at]',
      sync_outbox: '&id, tenant_id, entity_name, entity_id, sync_status, created_at_utc, [tenant_id+sync_status+created_at_utc]'
    });
  }
}

export const localBrowserDb = new InventoryDexieDatabase();