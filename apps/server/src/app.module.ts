import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SyncController } from './modules/sync/sync.controller';
import { SyncService } from './modules/sync/sync.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SuperSecretKeyPakCommercial2026',
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [SyncController],
  providers: [SyncService]
})
export class AppModule {}