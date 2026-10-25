import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesGuard } from '../../common/roles';
@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, JwtAuthGuard],
})
export class UsersModule {}

