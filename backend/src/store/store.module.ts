import { Module } from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { StoreController } from './store.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StoreController],
  providers: [StoreRepository],
  exports: [StoreRepository],
})
export class StoreModule {}
