import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { RolesGuard } from '../../common/roles';
import { DomainService } from '../../common/domain.service';
import { AuditController } from './audit.controller';
@Module({ controllers: [AuditController], providers: [JwtAuthGuard, RolesGuard, DomainService] }) export class AuditModule {}
