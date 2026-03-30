import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [AuthModule, StoreModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
