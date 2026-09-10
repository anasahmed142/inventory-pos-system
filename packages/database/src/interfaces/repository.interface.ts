// packages/database/src/interfaces/repository.interface.ts
import type {
  Product,
  Party,
  Order,
  OrderItem,
  LedgerEntry,
  SyncOutboxItem,
  LedgerEntryType
} from '@inventory/shared-types';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IRepository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Partial<T>, options?: QueryOptions): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface IProductRepository extends IRepository<Product> {
  findByBarcode(barcode: string): Promise<Product | null>;
  updateStock(id: string, quantityDelta: number): Promise<void>;
  findLowStock(threshold?: number): Promise<Product[]>;
}

export interface LedgerEntryInput {
  tenant_id: string;
  party_id: string;
  order_id?: string | null;
  entry_type: LedgerEntryType;
  amount: number;
  description?: string;
  urdu_description?: string;
}

export interface IKhataRepository extends IRepository<LedgerEntry> {
  recordTransaction(partyId: string, entry: LedgerEntryInput): Promise<LedgerEntry>;
  getPartyLedger(partyId: string, options?: QueryOptions): Promise<LedgerEntry[]>;
  getPartyCurrentBalance(partyId: string): Promise<number>;
}

export interface IOrderRepository extends IRepository<Order> {
  createOrderWithItems(order: Order, items: OrderItem[]): Promise<Order>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
}

export interface ISyncOutboxRepository extends IRepository<SyncOutboxItem> {
  getPendingBatch(batchSize: number): Promise<SyncOutboxItem[]>;
  markSynced(ids: string[]): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}

export interface IUnitOfWork {
  products: IProductRepository;
  parties: IRepository<Party>;
  orders: IOrderRepository;
  khata: IKhataRepository;
  syncOutbox: ISyncOutboxRepository;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}