// packages/database/src/factory/storage-factory.ts
import { createContext, useContext } from 'react';
import type {
  IProductRepository,
  IKhataRepository,
  IOrderRepository,
  IRepository
} from '../interfaces/repository.interface';
import type { Party, Category, Unit } from '@inventory/shared-types';

import {
  SqliteProductRepository,
  SqliteKhataRepository,
  SqliteOrderRepository,
  BaseSqliteRepository
} from '../adapters/sqlite.adapter';

import {
  DexieProductRepository,
  DexieKhataRepository,
  DexieOrderRepository,
  DexieRepository
} from '../adapters/dexie-repo.adapter';
import { localBrowserDb } from '../adapters/dexie.adapter';

export type OperationalMode = 'local_offline' | 'cloud_online' | 'hybrid_sync';

export interface DatabaseContextValue {
  mode: OperationalMode;
  isDesktop: boolean;
  products: IProductRepository;
  khata: IKhataRepository;
  orders: IOrderRepository;
  parties: IRepository<Party>;
  categories: IRepository<Category>;
  units: IRepository<Unit>;
}

export class StorageProviderFactory {
  public static create(tenantId: string, mode: OperationalMode = 'hybrid_sync'): DatabaseContextValue {
    const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    if (isDesktop) {
      return {
        mode,
        isDesktop: true,
        products: new SqliteProductRepository(tenantId),
        khata: new SqliteKhataRepository(tenantId),
        orders: new SqliteOrderRepository(tenantId),
        parties: new BaseSqliteRepository<Party>('parties', tenantId),
        categories: new BaseSqliteRepository<Category>('categories', tenantId),
        units: new BaseSqliteRepository<Unit>('units', tenantId)
      };
    }

    return {
      mode,
      isDesktop: false,
      products: new DexieProductRepository(tenantId),
      khata: new DexieKhataRepository(tenantId),
      orders: new DexieOrderRepository(tenantId),
      parties: new DexieRepository<Party>(localBrowserDb.parties, 'parties', tenantId),
      categories: new DexieRepository<Category>(localBrowserDb.categories, 'categories', tenantId),
      units: new DexieRepository<Unit>(localBrowserDb.units, 'units', tenantId)
    };
  }
}

export const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};