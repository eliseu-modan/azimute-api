import { Module } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard } from '../../common/auth';
import { FollowUpsController } from './follow-ups.controller';
@Module({ controllers: [FollowUpsController], providers: [DomainService, JwtAuthGuard] }) export class FollowUpsModule {}
