import { Module } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard } from '../../common/auth';
import { TasksController } from './tasks.controller';
@Module({ controllers: [TasksController], providers: [DomainService, JwtAuthGuard] }) export class TasksModule {}
