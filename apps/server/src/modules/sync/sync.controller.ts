// apps/server/src/modules/sync/sync.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushRequestDto, SyncPushResponseDto, SyncPullRequestDto, SyncPullResponseDto } from './dto/sync.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async pushMutations(@Req() req: any, @Body() dto: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    const tenantId = req.headers['x-tenant-id'] || 'tenant-root-001';
    return this.syncService.processPushBatch(tenantId, dto);
  }

  @Post('pull')
  async pullDeltas(@Req() req: any, @Body() dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    const tenantId = req.headers['x-tenant-id'] || 'tenant-root-001';
    return this.syncService.getPullDeltas(tenantId, dto);
  }
}