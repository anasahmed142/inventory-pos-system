// packages/database/src/adapters/remote-api.adapter.ts
import type { IRepository, QueryOptions } from '../interfaces/repository.interface';

export class RemoteApiRepository<T extends { id: string }> implements IRepository<T> {
  constructor(
    private readonly endpoint: string,
    private readonly baseUrl: string,
    private readonly tokenGetter: () => string | null,
    private readonly tenantId: string
  ) {}

  private async fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
    const token = this.tokenGetter();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>)
    };

    const res = await fetch(`${this.baseUrl}${this.endpoint}${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error [${res.status}]: ${err}`);
    }
    return res;
  }

  async findById(id: string): Promise<T | null> {
    const res = await this.fetchWithAuth(`/${id}`);
    return res.json();
  }

  async findMany(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined) params.append(k, String(v));
      });
    }
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const res = await this.fetchWithAuth(`?${params.toString()}`);
    return res.json();
  }

  async create(entity: T): Promise<T> {
    const res = await this.fetchWithAuth('', {
      method: 'POST',
      body: JSON.stringify(entity)
    });
    return res.json();
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const res = await this.fetchWithAuth(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.json();
  }

  async delete(id: string): Promise<boolean> {
    await this.fetchWithAuth(`/${id}`, { method: 'DELETE' });
    return true;
  }
}