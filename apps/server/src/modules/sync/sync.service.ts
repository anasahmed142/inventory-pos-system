// apps/server/src/modules/sync/sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SyncPushRequestDto, SyncPushResponseDto, SyncPullRequestDto, SyncPullResponseDto } from './dto/sync.dto';
import { ConflictResolver } from './conflict-resolver';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  public async processPushBatch(tenantId: string, dto: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    const syncedIds: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const change of dto.changes) {
      try {
        syncedIds.push(change.id);
      } catch (err: any) {
        failed.push({ id: change.id, reason: err.message });
      }
    }

    return { syncedIds, failed, checkpointUtc: new Date().toISOString() };
  }

  public async getPullDeltas(tenantId: string, dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    return { checkpointUtc: new Date().toISOString(), changes: [] };
  }
}