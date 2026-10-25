import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
import { ReportsController } from './reports.controller';
@Module({ controllers: [ReportsController], providers: [JwtAuthGuard, DomainService] }) export class ReportsModule {}
