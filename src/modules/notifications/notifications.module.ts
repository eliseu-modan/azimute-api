import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
import { NotificationsController } from './notifications.controller';
@Module({ controllers: [NotificationsController], providers: [JwtAuthGuard, DomainService] }) export class NotificationsModule {}
