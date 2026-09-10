// apps/server/src/modules/sync/dto/sync.dto.ts
import { IsString, IsArray, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

export class SyncMutationDto {
  @IsString() id: string;
  @IsString() tableName: string;
  @IsString() entityId: string;
  @IsEnum(['INSERT', 'UPDATE', 'DELETE']) action: SyncAction;
  @IsOptional() payload: Record<string, any>;
  @IsNumber() clientVersion: number;
  @IsString() clientCreatedAtUtc: string;
}

export class SyncPushRequestDto {
  @IsString() clientId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SyncMutationDto) changes: SyncMutationDto[];
}

export class SyncPushResponseDto {
  syncedIds: string[];
  failed: Array<{ id: string; reason: string }>;
  checkpointUtc: string;
}

export class SyncPullRequestDto {
  @IsString() lastSyncTimestampUtc: string;
}

export class SyncPullResponseDto {
  checkpointUtc: string;
  changes: Array<{ entity: string; data: Record<string, any>; isDeleted: boolean }>;
}